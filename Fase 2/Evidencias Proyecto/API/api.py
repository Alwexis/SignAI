from typing import Optional, Dict, List
from fastapi import Depends, FastAPI, HTTPException, Header, UploadFile, WebSocket, WebSocketDisconnect, Form
from fastapi.middleware.cors import CORSMiddleware
from auth import register_user_if_not_exist
import auth
from util import transcribe_audio, handleAudio, handleVideo, find_images_by_sentence, predict_video
from db import db
from models import _User, User as SignAIUser
from firebase_admin import auth
from firebase import init_firebase
from api_keys import authenticate_api_key, add_api_key_to_user, revoke_api_key, decrement_quota
from pydantic import BaseModel
from collections import defaultdict

init_firebase()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

#* Definimos un Diccionario para gestionar las salas y sus conexiones
salas: Dict[str, List[WebSocket]] = defaultdict(list)
LIMITE_POR_SALA = 2

#* Definimos una función para enviar mensajes a todos los miembros de una sala
async def enviar_a_sala(sala: str, mensaje: dict):
    if sala in salas:
        for websocket in salas[sala]:
            try:
                await websocket.send_json(mensaje)
            except WebSocketDisconnect:
                print(f"WebSocket desconectado para sala {sala}")
                salas[sala].remove(websocket)
        if not salas[sala]:
            del salas[sala]
    else:
        print(f"Sala {sala} no encontrada")

#? Voz a Señas
@app.post("/speech-to-text")
#async def get_translation(file: UploadFile, x_api_key: str = Header(...)):
async def classify_video(file: UploadFile, x_api_key: str = Header(...), sala: str = Form(...)):
    if (x_api_key != '__bypass__'):
        user = authenticate_api_key(x_api_key)
        if not user:
            raise HTTPException(status_code=403, detail="API Key inválida o desactivada")

        # Reduce la cuota de voz a señas
        decrement_quota(user.uid, "voice_to_sign")
    
    r = handleAudio(file, False)
    audio_id = r['audio_id']
    wav_file = r['file']
    #? Y transcribo el audio wave. Para funcionamiento, ver archivo "util.py"
    transcription = transcribe_audio(wav_file)
    # handleAudio(file, True, audio_id)
    images = find_images_by_sentence(transcription)
    #images = _find_img_by_sentence(transcription)
    #! data = find_images_by_sentence(transcription)
    
    response = { "transcription": transcription, "images": images, "resultType": "images" }

    # Enviar la respuesta por WebSocket si hay una sala especificada
    print(sala)
    if sala:
        await enviar_a_sala(sala, response)
    
    return response
    # return { "transcription": transcription, "images": images }

#? Vídeo a Señas
@app.post("/video-to-text")
# async def classify_video(file: UploadFile, x_api_key: str = Header(...)):
async def classify_video(file: UploadFile, x_api_key: str = Header(...), sala: str = Form(...)):
    if (x_api_key != '__bypass__'):
        user = authenticate_api_key(x_api_key)
        if not user:
            raise HTTPException(status_code=403, detail="API Key inválida o desactivada")

        # Reduce la cuota de video a texto
        decrement_quota(user.uid, "video_to_text")

    print(file)
    r = handleVideo(file, False)
    print(r)
    video_id = r['video_id']
    predictions = predict_video(video_id)

    response = { "status": "ok", "predictions": predictions, "resultType": "text" }

    # Enviar la respuesta por WebSocket si hay una sala especificada
    print(sala)
    if sala:
        await enviar_a_sala(sala, response)
    
    return response
    # return { "status": "ok", "predictions": predictions }

#? WebSocket para salas
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    sala = websocket.query_params.get("sala")  # Obtiene la sala de los parámetros de consulta
    await websocket.accept()

    if not sala:
        await websocket.send_text("Debes especificar una sala para unirte.")
        await websocket.close()
        return

    if len(salas[sala]) >= LIMITE_POR_SALA:
        await websocket.send_text("La sala está llena. No puedes unirte.")
        await websocket.close()
        return

    salas[sala].append(websocket)  # Añade el WebSocket a la sala
    try:
        while True:
            # Mantener la conexión abierta
            await websocket.receive_text()
    except WebSocketDisconnect:
        salas[sala].remove(websocket)
        if not salas[sala]:
            del salas[sala]

#? Registramos al usuario
@app.post("/user")
async def register_user(user: _User):
    register_user_if_not_exist(user)
    return { "status": "ok" }

#? Middleware
# Función para validar el token de Firebase
async def get_current_user(authorization: Optional[str] = Header(None)):
    #? Revisamos si el token BEARER está presente
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token BEARER no encontrado")
    #? Extraemos el token de la cabecera
    token = authorization.split("Bearer ")[1]
    try:
        #? Verificamos el token con Firebase y además, lo decodificamos para obtener el userid (correo)
        decoded_token = auth.verify_session_cookie(token)
        uid = decoded_token["uid"]
        return uid
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token BEARER inválido")

#? Obtenemos el usuario
@app.get("/user")
async def get_user_info(uid: str = Depends(get_current_user)):
    #? Buscamos en la base de datos al usuario con userid del token extraído por el middleware y excluimos el atributo _id
    user = db.users.find_one({"uid": uid}, { "_id": 0 })
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {
        "uid": user["uid"],
        "provider": user["provider"],
        "name": user.get("name"),
        "email": user.get("email"),
        "plan": user.get("plan"),
        "quota": user.get("quota"),
        "api_keys": user.get("api_keys")
    }

#? Creamos APIKey
@app.post("/api-key")
async def create_api_key(uid: str = Depends(get_current_user)):
    user = db.users.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    api_key = add_api_key_to_user(uid)
    if not api_key:
        raise HTTPException(status_code=404, detail="No se pudo crear la API Key")
    return { "status": "ok", "api_key": api_key }

#? Revocamos APIKey
class RevokeAPIKeyRequest(BaseModel):
    key_hash: str

@app.delete("/api-key")
async def delete_api_key(request: RevokeAPIKeyRequest, uid: str = Depends(get_current_user)):
    result = revoke_api_key(uid, request.key_hash)
    if not result:
        raise HTTPException(status_code=404, detail="No se pudo revocar la API Key")
    return { "status": "ok" }