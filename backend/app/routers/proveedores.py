from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.proveedor import Proveedor
from app.schemas.proveedor import ProveedorCreate, ProveedorUpdate, ProveedorResponse
from app.utils.auth import verificar_rol

router = APIRouter(prefix="/api/proveedores", tags=["Proveedores"])

@router.get("/", response_model=List[ProveedorResponse])
def obtener_proveedores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA"]))):
    return db.query(Proveedor).offset(skip).limit(limit).all()

@router.post("/", response_model=ProveedorResponse, status_code=status.HTTP_201_CREATED)
def crear_proveedor(proveedor: ProveedorCreate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA"]))):
    db_prov = db.query(Proveedor).filter(Proveedor.nit == proveedor.nit).first()
    if db_prov:
        raise HTTPException(status_code=400, detail="Ya existe un proveedor con este NIT.")
    nuevo = Proveedor(**proveedor.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{proveedor_id}", response_model=ProveedorResponse)
def actualizar_proveedor(proveedor_id: int, proveedor: ProveedorUpdate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA"]))):
    db_prov = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not db_prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    for key, value in proveedor.model_dump(exclude_unset=True).items():
        setattr(db_prov, key, value)
    db.commit()
    db.refresh(db_prov)
    return db_prov

@router.delete("/{proveedor_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_proveedor(proveedor_id: int, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN"]))):
    db_prov = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not db_prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    db.delete(db_prov)
    db.commit()
    return None