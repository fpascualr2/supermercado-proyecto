from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    categoria_id: int
    precio_compra: float
    precio_venta: float
    existencia: Optional[int] = 0
    stock_minimo: Optional[int] = 0
    estado: Optional[bool] = True

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None
    precio_compra: Optional[float] = None
    precio_venta: Optional[float] = None
    existencia: Optional[int] = None
    stock_minimo: Optional[int] = None
    estado: Optional[bool] = None

class ProductoResponse(ProductoBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)