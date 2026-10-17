from sqlalchemy import Column, BigInteger, String, Text, Date, DateTime
from sqlalchemy.sql import func
from app.db import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    nit = Column(String(20), unique=True, nullable=True)
    telefono = Column(String(30), nullable=True)
    correo = Column(String(150), unique=True, nullable=True)
    direccion = Column(Text, nullable=True)
    fecha_registro = Column(Date, server_default=func.current_date(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)