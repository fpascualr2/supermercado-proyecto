from sqlalchemy import Column, BigInteger, Integer, String, Numeric, DateTime, ForeignKey, Computed
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base

class Compra(Base):
    __tablename__ = "compras"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    numero = Column(String(30), unique=True, nullable=False)
    proveedor_id = Column(BigInteger, ForeignKey("proveedores.id"), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    usuario_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    total = Column(Numeric(14, 2), nullable=False, default=0)
    estado = Column(String(20), nullable=False, default='REGISTRADA')

    detalles = relationship("DetalleCompra", back_populates="compra", cascade="all, delete-orphan")
    proveedor = relationship("Proveedor")
    usuario = relationship("Usuario")

class DetalleCompra(Base):
    __tablename__ = "detalle_compras"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    compra_id = Column(BigInteger, ForeignKey("compras.id", ondelete="CASCADE"), nullable=False)
    producto_id = Column(BigInteger, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_compra = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(14, 2), Computed("cantidad * precio_compra", persisted=True))

    compra = relationship("Compra", back_populates="detalles")
    producto = relationship("Producto")