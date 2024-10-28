from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, Header, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from auth import register_user_if_not_exist
import auth
from util import transcribe_audio, handleAudio, handleVideo, find_images_by_sentence
from db import db
from models import _User, User as SignAIUser
from firebase_admin import auth
from firebase import init_firebase
from api_keys import authenticate_api_key, add_api_key_to_user, revoke_api_key

init_firebase()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

#? Voz a Señas
@app.post("/speech-to-text")
async def get_translation(file: UploadFile):
    r = handleAudio(file, False)
    audio_id = r['audio_id']
    wav_file = r['file']
    #? Y transcribo el audio wave. Para funcionamiento, ver archivo "util.py"
    transcription = transcribe_audio(wav_file)
    handleAudio(file, True, audio_id)
    images = find_images_by_sentence(transcription)
    #! data = find_images_by_sentence(transcription)
    return { "transcription": transcription, "images": images }
    #! return { 'full_transcription': transcription, 'data': data }

#? Vídeo a Señas
@app.post("/video-to-text")
async def classify_video(file: UploadFile):
    print(file)
    r = handleVideo(file, False)
    print(r)
    return { "status": "ok" }

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
    print("Creating API Key")
    user = db.users.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    api_key = add_api_key_to_user(uid)
    if not api_key:
        raise HTTPException(status_code=404, detail="No se pudo crear la API Key")
    return { "status": "ok", "api_key": api_key }