from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.compra import Compra, DetalleCompra
from app.models.producto import Producto
from app.schemas.compra import CompraCreate, CompraResponse
from app.utils.auth import verificar_rol

router = APIRouter(prefix="/api/compras", tags=["Compras"])

@router.get("/", response_model=List[CompraResponse])
def obtener_compras(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA", "CAJERO"]))):
    return db.query(Compra).offset(skip).limit(limit).all()

@router.post("/", response_model=CompraResponse, status_code=status.HTTP_201_CREATED)
def crear_compra(compra_data: CompraCreate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "BODEGA", "CAJERO"]))):
    total_calculado = 0
    detalles_db = []

    for item in compra_data.detalles:
        prod = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto con ID {item.producto_id} no encontrado")
        
        subtotal = item.cantidad * item.precio_compra
        total_calculado += subtotal

        # Aumentar stock automáticamente al reabastecer
        prod.existencia += item.cantidad
        prod.precio_compra = item.precio_compra # Actualiza opcionalmente el costo

        detalles_db.append(
            DetalleCompra(
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio_compra=item.precio_compra
            )
        )

    nueva_compra = Compra(
        numero=compra_data.numero,
        proveedor_id=compra_data.proveedor_id,
        usuario_id=compra_data.usuario_id,
        total=total_calculado,
        estado='REGISTRADA',
        detalles=detalles_db
    )

    db.add(nueva_compra)
    db.commit()
    db.refresh(nueva_compra)
    return nueva_compra