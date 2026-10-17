from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class ClienteBase(BaseModel):
    nombres: str
    apellidos: str
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None

class ClienteResponse(ClienteBase):
    id: int
    fecha_registro: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)