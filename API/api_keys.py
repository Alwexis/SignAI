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
    result = db.users.update_one(
        {"uid": user_id},
        {"$push": {"api_keys": api_key_obj.model_dump(by_alias=True)}}
    )
    
    if result.modified_count == 1:
        return raw_key
    else:
        raise Exception("No se pudo agregar la API Key al usuario")
    
def authenticate_api_key(key_hash: str) -> Optional[User]:    
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
    # Busca el usuario en la base de datos
    user = db.users.find_one({"uid": user_id})
    if not user:
        raise Exception("Usuario no encontrado")
    
    # Intenta eliminar la API key con el key_hash proporcionado
    result = db.users.update_one(
        {"uid": user_id, "api_keys.keyHash": key_hash},
        {"$pull": {"api_keys": {"keyHash": key_hash}}}
    )
    
    # Verifica si se modificó algún documento (si se eliminó la API key)
    if result.modified_count == 1:
        return True
    else:
        raise Exception("La API Key no pertenece al usuario o ya fue revocada")
    
def decrement_quota(user_id: str, resource: str):
    user = db.users.find_one({"uid": user_id})
    if not user:
        raise Exception("Usuario no encontrado")
    
    # Verifica que el recurso exista y tenga una cantidad mayor a 0
    current_quota = user.get("quota", {})
    if resource not in current_quota:
        raise Exception(f"El recurso '{resource}' no existe en la cuota del usuario")
    
    if current_quota[resource] <= 0:
        raise Exception(f"La cuota para el recurso '{resource}' se ha agotado")

    # Realiza el decremento en la base de datos
    result = db.users.update_one(
        {"uid": user_id},
        {"$inc": {f"quota.{resource}": -1}}
    )
    
    if result.modified_count != 1:
        raise Exception("No se pudo actualizar la cuota del usuario")