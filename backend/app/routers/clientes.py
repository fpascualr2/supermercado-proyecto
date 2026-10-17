from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from app.utils.auth import verificar_rol

router = APIRouter(
    prefix="/api/clientes",
    tags=["Clientes"]
)

@router.get("/", response_model=List[ClienteResponse])
def obtener_clientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "CAJERO"]))):
    return db.query(Cliente).offset(skip).limit(limit).all()

@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def crear_cliente(cliente: ClienteCreate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "CAJERO"]))):
    if cliente.nit:
        db_nit = db.query(Cliente).filter(Cliente.nit == cliente.nit).first()
        if db_nit:
            raise HTTPException(status_code=400, detail="Ya existe un cliente registrado con este NIT.")
            
    nuevo_cliente = Cliente(**cliente.model_dump())
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)
    return nuevo_cliente

@router.put("/{cliente_id}", response_model=ClienteResponse)
def actualizar_cliente(cliente_id: int, cliente: ClienteUpdate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "CAJERO"]))):
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    for key, value in cliente.model_dump(exclude_unset=True).items():
        setattr(db_cliente, key, value)
        
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN"]))):
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    db.delete(db_cliente)
    db.commit()
    return None