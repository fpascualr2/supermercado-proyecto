from sqlalchemy import Column, BigInteger, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db import Base

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)