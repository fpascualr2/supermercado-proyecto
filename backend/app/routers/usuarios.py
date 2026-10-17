from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import bcrypt

from app.db import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse, UsuarioLogin
from app.utils.auth import crear_token_acceso, obtener_usuario_actual, verificar_rol

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

@router.get("/", response_model=List[UsuarioResponse])
def obtener_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN"]))):
    return db.query(Usuario).offset(skip).limit(limit).all()

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN"]))):
    db_user = db.query(Usuario).filter(Usuario.username == usuario.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado.")
    
    hashed_password = get_password_hash(usuario.password)
    
    nuevo = Usuario(
        nombre=usuario.nombre,
        username=usuario.username,
        password_hash=hashed_password,
        rol=usuario.rol,
        estado=usuario.estado
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# Esquema para actualización parcial
class UsuarioUpdateSchema(BaseModel):
    nombre: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    rol: Optional[str] = None
    estado: Optional[bool] = None

@router.put("/{usuario_id}")
def actualizar_usuario(usuario_id: int, usuario_data: UsuarioUpdateSchema, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN"]))):
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    update_data = usuario_data.dict(exclude_unset=True)
    
    # Si envían una nueva contraseña, la ciframos y actualizamos password_hash
    if "password" in update_data and update_data["password"]:
        update_data["password_hash"] = get_password_hash(update_data["password"])
        del update_data["password"]
    
    for key, value in update_data.items():
        setattr(db_usuario, key, value)
    
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db), current_user = Depends(verificar_rol(["ADMIN"]))):
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(db_usuario)
    db.commit()
    return None

@router.post("/login")
def login_usuario(credenciales: UsuarioLogin, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.username == credenciales.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    
    password_valida = bcrypt.checkpw(
        credenciales.password.encode('utf-8'),
        db_user.password_hash.encode('utf-8')
    )
    
    if not password_valida:
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
        
    if not db_user.estado:
        raise HTTPException(status_code=403, detail="El usuario se encuentra inactivo")
        
    access_token = crear_token_acceso(data={"sub": db_user.username, "rol": db_user.rol})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": db_user.id,
            "nombre": db_user.nombre,
            "username": db_user.username,
            "rol": db_user.rol
        }
    }