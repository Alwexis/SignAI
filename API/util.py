import subprocess
from vosk import Model, KaldiRecognizer
import json
import wave
from fastapi import UploadFile
from uuid import uuid4
import os
import ffmpeg
import shutil
from db import db

#! .-----------------------------------.
#! |                                   |
#! |    _    _        _           _    |
#! |   (_)  / \__   _(_)___  ___ | |   |
#! |   | | / _ \ \ / / / __|/ _ \| |   |
#! |   | |/ ___ \ V /| \__ \ (_) |_|   |
#! |   |_/_/   \_\_/ |_|___/\___/(_)   |
#! |                                   |
#! '-----------------------------------'
#* *************************************
#? El siguiente código estará documentado a full, aunque ésto sea una mala práctica,
#? ya que lo vemos necesario, al ser un código delicado y algo extenso, no queremos
#? olvidarnos de lo que hace algo u olvidarnos de algún detalle X que esté documentado.
#? Para los lectores del código, pedimos disculpas de antemano.

#? Cargamos el modelo VOSK.
model = Model("./models/vosk-model-es-0.42")

def handleAudio(file: UploadFile, delete: bool, audioId: str = ''):
    if not delete:
        #? Separo el tipo de archivo, ya que su formato es, por ejemplo, "audio/webm".
        #? Cuando lo separo con el método split() obtengo el último valor, es decir, "webm".
        content_type = file.content_type.split('/')[-1]
        #? Genero una UUID (valor único aleatorio) para ingresarlo como una "ID".
        audio_id = uuid4()
        file_name = f"{audio_id}.{content_type}"
        save_path = f"./__temp__/{file_name}"
        #! Para debug; creo la Carpeta si es que NO existe.
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        #? Almaceno el Archivo recibido en el SavePath y lo guardo en una variable Buffer.
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        #? Ahora transformo el Audio que guardé (webm) a formato "wav". Para funcionamiento,
        #? ver archivo "util.py"
        wav_file = transform_audio(audio_id, save_path)
        #? Ahora confirmo si es que se creó o convirtió a wav.
        if os.path.exists(wav_file):
            print(f"El archivo {wav_file} se ha convertido correctamente.")
        return { 'audio_id': audio_id, 'file': wav_file }
    else:
        webm_path = f"./__temp__/{audioId}.webm"
        wave_path = f"./__temp__/{audioId}.wav"
        os.remove(webm_path)
        os.remove(wave_path)

def find_images_by_sentence(sentence):
    print('Buscando imágenes para:')
    print(sentence)
    words = sentence.split()
    images = []
    #? Guardamos el índice de la Lista en "idx", para poder saltar palabras en caso
    #? de que sean "compuestas"
    idx = 0
    while idx < len(words):
        word = words[idx]
        nextWord = ''
        #? Verificamos si es que es un "auxiliar", ej: os, nos, que, te, etc.
        #? Si lo es, construimos la palabra "auxiliar".
        #? En caso de que no, construimos la palabra "compuesta", en caso de haberla.
        if len(word) < 4:
            word, nextWord, idx, skip = handle_auxiliary_words(words, idx)
        else:
            nextWord, idx, skip = handle_compound_words(words, idx)
        #? Almacenamos el resultado de la búsqueda.
        result = get_images_by_word(word, nextWord)
        images.extend(result['images'])
        
        #? En caso de que haya sido una palabra compuesta, ej: cómo estás.
        #? Cómo ya se marcó "cómo", saltaremos la siguiente palabra "estás" para
        #? no volver a interpretarla. Para ésto sumaremos "skip" a "idx".
        if result['compound']:
            idx += skip
        else:
            idx += 1
    print('¡Listo! Imágenes encontradas')
    return images

def handle_auxiliary_words(words, idx):
    word = words[idx]
    nextWord = ''
    skip = 1 #? Variable para contar el número de palabras a saltar
    
    if idx + 1 < len(words):
        #? _local_nextWord, ya que no es la nextWord final.
        _local_nextWord = words[idx + 1]
        if len(_local_nextWord) < 4:
            idx += 1
            skip += 1
            if idx + 1 < len(words):
                idx += 1
                skip += 1
                word += f" {_local_nextWord} {words[idx]}"
            else:
                word += f" {_local_nextWord}"
        else:
            word += f" {_local_nextWord}"
            skip += 1
    
    return word, nextWord, idx, skip

def handle_compound_words(words, idx):
    nextWord = ''
    skip = 1 #? Variable para contar el número de palabras a saltar
    
    if idx + 1 < len(words):
        _local_nextWord = words[idx + 1]
        if len(_local_nextWord) < 4:
            if idx + 1 < len(words):
                idx += 1
                skip += 1
                nextWord = f"{_local_nextWord} {words[idx]}"
            else:
                nextWord = _local_nextWord
                skip += 1
        else:
            nextWord = _local_nextWord
            skip += 1
    
    return nextWord, idx, skip

def get_images_by_word(word, nextWord=''):
    images = []
    wasCompound = False
    collection = db['_Diccionario_']
    
    #? Construimos la Query con Regex de la palabra. O su compuesto.
    compound_query = build_query(word, nextWord)
    
    _compound_results = list(collection.find(compound_query, {"_id": 0, "images": 1}))
    
    if _compound_results:
        wasCompound = True
        for result in _compound_results:
            images.extend(result['images'])
    else:
        #? Búsqueda de palabra sola
        single_query = build_query(word)
        results = list(collection.find(single_query, {"_id": 0, "images": 1}))
        if results:
            for result in results:
                images.extend(result['images'])
    
    return {"images": images, "compound": wasCompound}

def build_query(word, nextWord=''):
    #? Utilizaremos RegularExpressions para la búsqueda ya que se tratan de querys
    #? algo complejas. El ^ en la expresión significa "inicio"; sirve para decir que
    #? debe iniciar con lo que sigue.
    #? El $ en la expresión significa "finalizar"; sirve para decir que debe finalizar
    #? con la palabra.
    #* Esto fue porque existen casos de palabras cómo "hola", la cual está incluída
    #* en otras palabras, por ejemplo, "holanda". Así evitamos errores.
    if nextWord:
        regex = f"^{word} {nextWord}$"
    else:
        regex = f"^{word}$"
    return {"text": {"$regex": regex, "$options": "i"}}

def transform_audio(audio_name: str, path: str):
    wav_output_path = f"./__temp__/{audio_name}.wav"
    
    #? Comando para convertir de webm a wav usando ffmpeg
    #? En esta página pude ver el comando
    #* https://www.ffmpeg.org/ffmpeg.html#Video-and-Audio-file-format-conversion
    command = [
        'ffmpeg', '-i', path, '-vn',
        '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '1', wav_output_path
    ]
    
    #? Ejecutamos el comando dentro de un Try para manejar errores sin que crashee el sv.
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error al convertir el archivo: {e}")

    return wav_output_path

def transcribe_audio(wav_file: str):
    #? Abro como Buffer el archivo wave.
    wf = wave.open(wav_file, "rb")
    #? Reviso si efectivamente es un archivo wave con el formato que pide VOSK o no.
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() not in [8000, 16000, 32000, 44100, 48000]:
        raise ValueError("Audio no compatible. Debe ser WAV con un solo canal (mono), 16 bit, y una tasa de muestreo de 8000, 16000, 32000, 44100 o 48000 Hz.")
    
    #? Inicio el modelo de reconocedor con el modelo VOSK y como segundo parámetro le ingreso
    #? el framerate del Buffer
    recognizer = KaldiRecognizer(model, wf.getframerate())
    recognizer.SetWords(True)

    transcription = ""
    while True:
        data = wf.readframes(4000)
        #? Si es que ya NO hay data que leer, salgo del ciclo
        if len(data) == 0:
            break
        #? Reviso si es que la Data es formato wave y si lo es, obtengo el resultado
        #? y lo agrego a mi cadena de texto.
        if recognizer.AcceptWaveform(data):
            result = recognizer.Result()
            transcription += json.loads(result)['text'] + " "
    
    #? Obtengo el resultado Final, cierro el Buffer y devuelvo la transcripción con método
    #? "strip" para eliminar los espacios sobrantes.
    transcription += json.loads(recognizer.FinalResult())['text']
    wf.close()
    print('Audio transcrito')
    return transcription.strip()

def handleVideo(file: UploadFile, delete: bool, videoId: str = ''):
    if not delete:
        #? Se separa el tipo de archivo, ya que su formato es, por ejemplo, "video/webm".
        #? Cuando lo separamos con el método split() obtenemos el último valor, es decir, "webm".
        content_type = file.content_type.split('/')[-1]
        #? Generamos una UUID (valor único aleatorio) para ingresarlo como una "ID".
        video_id = uuid4()
        file_name = f"{video_id}.{content_type}"
        save_path = f"./__temp__/{file_name}"
        #! Para debug; se crea la Carpeta si es que NO existe.
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        #? Se almacena el Archivo recibido en el SavePath y se guarda en una variable Buffer.
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        #? Ahora transformamos el Video a "8fps".
        transform_to_24fps(save_path, f"./__temp__/{video_id}_8fps.mp4")
        #? Ahora dividimos el video en Frames.
        divide_video_by_frames(f"./__temp__/{video_id}_8.mp4", f"./__temp__/{video_id}_frames")
        #? Ahora confirmamos si es que se creó o convirtió a 8fps.
        if os.path.exists(f"./__temp__/{video_id}_8fps.mp4"):
            print(f"El archivo {video_id}_8fps.mp4 se ha convertido correctamente y se han dividido los frames.")
        #? Ahora confirmamos si es que están todos los frames almacenados.
        if os.path.exists(f"./__temp__/{video_id}_frames"):
            print(f"Los frames del video {video_id} se han guardado correctamente.")
        #? Hay que trabajar la transformación del vídeo de webm a algún otro dependiendo
        #? de lo que necesitemos.
        return { 'video_id': video_id }
    else:
        webm_path = f"./__temp__/{videoId}.webm"
        os.remove(webm_path)

def transform_to_24fps(input_video, output_video):
    #? Verificamos que el archivo en la ruta input_video existe o no.
    if not os.path.exists(input_video):
        raise FileNotFoundError(f"El archivo {input_video} no existe.")
    
    try:
        #? Comando de FFMPEG para convertir a 8 FPS
        ffmpeg.input(input_video).output(output_video, r=8).run(overwrite_output=True)
        print(f"Video transformado a 8 FPS y guardado como {output_video}.")
    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else "Error desconocido durante la conversión."
        print(f"Error durante la conversión: {error_message}")

def divide_video_by_frames(video_path, output_dir):
    #? Verificamos que el archivo en la ruta video_path existe o no.
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"El archivo {video_path} no existe.")
    
    #? Verificamos si la carpeta de output existe o no, sino, la creamos.
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    try:
        #? Extraemos frames usando ffmpeg y los almacenamos.
        ffmpeg.input(video_path).output(f"{output_dir}/frame_%04d.png").run(overwrite_output=True)
        print(f"Frames extraídos y guardados en {output_dir}.")
    except ffmpeg.Error as e:
        error_message = e.stderr.decode() if e.stderr else "Error desconocido al dividir el video."
        print(f"Error al dividir el video en frames: {error_message}")

#? Por si acaso xd
def backup_collection(source_collection_name, backup_collection_name):
    source_collection = db[source_collection_name]
    backup_collection = db[backup_collection_name]
    
    documents = source_collection.find()
    
    backup_collection.insert_many(documents)
    
    print(f"Backup de la colección '{source_collection_name}' creada como '{backup_collection_name}'.")