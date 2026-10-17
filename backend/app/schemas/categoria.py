from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CategoriaBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    estado: Optional[bool] = True

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None

class CategoriaResponse(CategoriaBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)