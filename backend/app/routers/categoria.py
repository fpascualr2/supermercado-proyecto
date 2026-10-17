from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, CategoriaResponse
from app.utils.auth import verificar_rol

router = APIRouter(
    prefix="/api/categorias",
    tags=["Categorías"]
)

@router.get("/", response_model=List[CategoriaResponse])
def obtener_categorias(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA", "CAJERO"]))):
    return db.query(Categoria).offset(skip).limit(limit).all()

@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA"]))):
    db_categoria = db.query(Categoria).filter(
        (Categoria.codigo == categoria.codigo) | (Categoria.nombre == categoria.nombre)
    ).first()
    if db_categoria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una categoría con el mismo código o nombre."
        )
    
    nueva_categoria = Categoria(**categoria.model_dump())
    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)
    return nueva_categoria

@router.put("/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(categoria_id: int, categoria: CategoriaUpdate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA"]))):
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    update_data = categoria.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_categoria, key, value)
        
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN"]))):
    # Solo el ADMIN puede eliminar categorías definitivamente
    db_categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    db.delete(db_categoria)
    db.commit()
    return None