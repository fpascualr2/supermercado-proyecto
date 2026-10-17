from sqlalchemy import Column, BigInteger, String, Text, Integer, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(30), unique=True, nullable=False, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    categoria_id = Column(BigInteger, ForeignKey("categorias.id"), nullable=False)
    precio_compra = Column(Numeric(12, 2), nullable=False)
    precio_venta = Column(Numeric(12, 2), nullable=False)
    existencia = Column(Integer, nullable=False, default=0)
    stock_minimo = Column(Integer, nullable=False, default=0)
    estado = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    categoria = relationship("Categoria")