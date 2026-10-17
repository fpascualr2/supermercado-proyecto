from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class DetalleVentaCreate(BaseModel):
    producto_id: int
    cantidad: int
    precio: float

class DetalleVentaResponse(DetalleVentaCreate):
    id: int
    subtotal: float
    model_config = ConfigDict(from_attributes=True)

class VentaCreate(BaseModel):
    numero: str
    cliente_id: Optional[int] = None
    usuario_id: int
    detalles: List[DetalleVentaCreate]

class VentaResponse(BaseModel):
    id: int
    numero: str
    fecha: datetime
    cliente_id: Optional[int] = None
    usuario_id: int
    total: float
    estado: str
    detalles: List[DetalleVentaResponse]

    model_config = ConfigDict(from_attributes=True)