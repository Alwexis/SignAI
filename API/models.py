from pydantic import BaseModel, Field
import datetime
from typing import Optional
import secrets
import hashlib

class APIKey(BaseModel):
    key: str = Field(..., alias="keyHash")
    created_at: datetime.datetime =  Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_used: Optional[datetime.datetime] = None
    active: bool = True
    
    @staticmethod
    def generate_raw_key(length: int = 32) -> str:
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_key(raw_key: str) -> str:
        return hashlib.sha256(raw_key.encode()).hexdigest()
    
    @classmethod
    def create(cls):
        raw_key = cls.generate_raw_key()
        key_hash = cls.hash_key(raw_key)
        return cls(
            keyHash=key_hash,
        ), raw_key

class Plan(BaseModel):
    name: str
    quota: dict[str, int] # Cuota de uso

class User(BaseModel):
    uid: str # User ID de Firebase
    provider: str # Proveedor (Email, Google o Github)
    name: str
    email: str
    plan: Plan # Plan: Hobby, Pro, Enterprise
    quota: dict[str, int] # Cuota de uso
    last_request: Optional[datetime.datetime] = None # Última petición
    api_keys: list[APIKey] # Lista de API Keys

class _User(BaseModel):
    uid: str # User ID de Firebase
    provider: str # Proveedor (Email, Google o Github)
    name: str
    email: str