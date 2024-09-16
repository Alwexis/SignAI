from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
import os
import shutil
from util import transcribe_audio, transform_audio, find_images_by_sentence

app = FastAPI()
#? Activamos todos los origenes CORS para evitar problemas luego.
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.post("/speech-to-text")
async def get_translation(file: UploadFile):
    #? Separo el tipo de archivo, ya que su formato es, por ejemplo, "audio/webm".
    #? Cuando lo separo con el método split() obtengo el último valor, es decir, "webm".
    content_type = file.content_type.split('/')[-1]
    #? Genero una UUID (valor único aleatorio) para ingresarlo como una "ID".
    video_id = uuid4()
    file_name = f"{video_id}.{content_type}"
    save_path = f"./__temp__/{file_name}"
    #! Para debug; creo la Carpeta si es que NO existe.
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    #? Almaceno el Archivo recibido en el SavePath y lo guardo en una variable Buffer.
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    #? Ahora transformo el Audio que guardé (webm) a formato "wav". Para funcionamiento,
    #? ver archivo "util.py"
    wav_file = transform_audio(video_id, save_path)
    #? Ahora confirmo si es que se creó o convirtió a wav.
    if os.path.exists(wav_file):
        print(f"El archivo {wav_file} se ha convertido correctamente.")
    #? Y transcribo el audio wave. Para funcionamiento, ver archivo "util.py"
    transcription = transcribe_audio(wav_file)
    images = find_images_by_sentence(transcription)
    
    return { "transcription": transcription, "images": images }
