from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ProveedorBase(BaseModel):
    nombre: str
    nit: str
    nombre_contacto: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = True

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    nit: Optional[str] = None
    nombre_contacto: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = None

class ProveedorResponse(ProveedorBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)