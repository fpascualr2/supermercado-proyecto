from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse
from app.utils.auth import verificar_rol

router = APIRouter(
    prefix="/api/productos",
    tags=["Productos"]
)

@router.get("/", response_model=List[ProductoResponse])
def obtener_productos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA", "CAJERO"]))):
    return db.query(Producto).offset(skip).limit(limit).all()

@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA"]))):
    db_prod = db.query(Producto).filter(Producto.codigo == producto.codigo).first()
    if db_prod:
        raise HTTPException(status_code=400, detail="Ya existe un producto con este código.")
    
    nuevo_producto = Producto(**producto.model_dump())
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(producto_id: int, producto: ProductoUpdate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA"]))):
    db_prod = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    for key, value in producto.model_dump(exclude_unset=True).items():
        setattr(db_prod, key, value)
        
    db.commit()
    db.refresh(db_prod)
    return db_prod

@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN"]))):
    db_prod = db.query(Producto).filter(Producto.id == producto_id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db.delete(db_prod)
    db.commit()
    return None