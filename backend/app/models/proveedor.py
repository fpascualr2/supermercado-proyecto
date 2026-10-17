from sqlalchemy import Column, BigInteger, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.db import Base

class Proveedor(Base):
    __tablename__ = "proveedores"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    nit = Column(String(20), unique=True, nullable=False)
    nombre_contacto = Column(String(120), nullable=True)
    telefono = Column(String(30), nullable=True)
    correo = Column(String(150), nullable=True)
    direccion = Column(Text, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)