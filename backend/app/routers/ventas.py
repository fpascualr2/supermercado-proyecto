from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.venta import Venta, DetalleVenta
from app.models.producto import Producto
from app.schemas.venta import VentaCreate, VentaResponse
from app.utils.auth import verificar_rol

router = APIRouter(prefix="/api/ventas", tags=["Ventas"])

@router.get("/", response_model=List[VentaResponse])
def obtener_ventas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "CAJERO"]))):
    return db.query(Venta).offset(skip).limit(limit).all()

@router.post("/", response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
def crear_venta(venta_data: VentaCreate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN", "CAJERO"]))):
    total_calculado = 0
    detalles_db = []

    for item in venta_data.detalles:
        prod = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Producto con ID {item.producto_id} no encontrado")
        if prod.existencia < item.cantidad:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para el producto {prod.nombre}")
        
        subtotal = item.cantidad * item.precio
        total_calculado += subtotal

        # Descontar stock automáticamente
        prod.existencia -= item.cantidad

        detalles_db.append(
            DetalleVenta(
                producto_id=item.producto_id,
                cantidad=item.cantidad,
                precio=item.precio
            )
        )

    nueva_venta = Venta(
        numero=venta_data.numero,
        cliente_id=venta_data.cliente_id,
        usuario_id=venta_data.usuario_id,
        total=total_calculado,
        estado='REGISTRADA',
        detalles=detalles_db
    )

    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)
    return nueva_venta