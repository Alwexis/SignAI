import firebase_admin
from firebase_admin import credentials, auth

# Inicializa Firebase Admin con tus credenciales
def init_firebase():
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)