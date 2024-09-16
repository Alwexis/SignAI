import subprocess
from vosk import Model, KaldiRecognizer
import json
import wave
from pymongo import MongoClient

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
client = MongoClient('credenciales')
db = client['Hermes']

def find_images_by_sentence(sentence):
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

    return transcription.strip()

#? Por si acaso xd
def backup_collection(source_collection_name, backup_collection_name):
    source_collection = db[source_collection_name]
    backup_collection = db[backup_collection_name]
    
    documents = source_collection.find()
    
    backup_collection.insert_many(documents)
    
    print(f"Backup de la colección '{source_collection_name}' creada como '{backup_collection_name}'.")