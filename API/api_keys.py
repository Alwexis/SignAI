import datetime
from typing import Optional
from db import db
from models import APIKey, User

MAX_API_KEYS = {
    "Hobby": 2,
    "Pro": 10,
    "Enterprise": 50
}

def add_api_key_to_user(user_id: str):
    user = db.users.find_one({"uid": user_id})
    if not user:
        raise Exception("Usuario no encontrado")
    
    # Cambiar a futuro para leer el plan actual del usuario.
    plan = user.get("plan", "Hobby")
    current_keys = user.get("api_keys", [])
    if len(current_keys) >= MAX_API_KEYS.get(plan['name'], 2):
        raise Exception(f"Has alcanzado el límite de API Keys para el plan {plan['name']}")
    
    # Proceder a generar y agregar la API Key
    api_key_obj, raw_key = APIKey.create()
    print(api_key_obj)
    print(raw_key)
    result = db.users.update_one(
        {"uid": user_id},
        {"$push": {"api_keys": api_key_obj.model_dump(by_alias=True)}}
    )
    
    if result.modified_count == 1:
        return raw_key
    else:
        raise Exception("No se pudo agregar la API Key al usuario")
    
def authenticate_api_key(raw_key: str) -> Optional[User]:
    key_hash = APIKey.hash_key(raw_key)
    
    user = db.users.find_one({
        "api_keys": {
            "$elemMatch": {
                "keyHash": key_hash,
                "active": True
            }
        }
    })
    
    return User(**user) if user else None

def revoke_api_key(user_id: str, key_hash: str):
    result = db.users.update_one(
        {"uid": user_id, "api_keys.keyHash": key_hash},
        {"$set": {"api_keys.$.active": False}}
    )
    
    if result.modified_count == 1:
        return True
    else:
        return False