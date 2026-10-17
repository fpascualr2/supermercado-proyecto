from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DetalleCompraCreate(BaseModel):
    producto_id: int
    cantidad: int
    precio_compra: float

class CompraCreate(BaseModel):
    numero: str
    proveedor_id: int
    usuario_id: int
    detalles: List[DetalleCompraCreate]

class DetalleCompraResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_compra: float
    subtotal: float

    class Config:
        from_attributes = True

class CompraResponse(BaseModel):
    id: int
    numero: str
    proveedor_id: int
    fecha: datetime
    usuario_id: int
    total: float
    estado: str
    detalles: List[DetalleCompraResponse] = []

    class Config:
        from_attributes = True