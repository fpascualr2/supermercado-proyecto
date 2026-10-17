from sqlalchemy import Column, BigInteger, Integer, String, Numeric, DateTime, ForeignKey, Computed
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    numero = Column(String(30), unique=True, nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    cliente_id = Column(BigInteger, ForeignKey("clientes.id"), nullable=True)
    usuario_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    total = Column(Numeric(14, 2), nullable=False, default=0)
    estado = Column(String(20), nullable=False, default='REGISTRADA')

    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")

class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"

    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id", ondelete="CASCADE"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio = Column(Numeric(12, 2), nullable=False)
    
    subtotal = Column(Numeric(14, 2), Computed("cantidad * precio", persisted=True))

    # ¡Agrega esta línea para completar la relación bidireccional!
    venta = relationship("Venta", back_populates="detalles")