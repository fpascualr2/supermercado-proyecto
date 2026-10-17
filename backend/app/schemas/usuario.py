from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    nombre: str
    username: str
    rol: Optional[str] = 'CAJERO'
    estado: Optional[bool] = True

class UsuarioCreate(UsuarioBase):
    password: str

# Nuevo esquema para validar el inicio de sesión
class UsuarioLogin(BaseModel):
    username: str
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    username: Optional[str] = None
    rol: Optional[str] = None
    estado: Optional[bool] = None

class UsuarioResponse(UsuarioBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)