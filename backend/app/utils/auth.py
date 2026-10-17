import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.db import get_db
from app.models.usuario import Usuario

SECRET_KEY = settings.jwt_secret
ALGORITHM = "HS256"

# Define la ruta de donde Swagger extraerá el token si es necesario
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/usuarios/login")

def crear_token_acceso(data: dict):
    to_encode = data.copy()
    # El token expirará en 8 horas (puedes ajustarlo)
    expire = datetime.now(timezone.utc) + timedelta(hours=8)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales o el token ha expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(Usuario).filter(Usuario.username == username).first()
    if user is None or not user.estado:
        raise credentials_exception
    return user

def verificar_rol(roles_permitidos: list[str]):
    """Dependencia para restringir endpoints según el rol del usuario"""
    def rol_dependency(current_user: Usuario = Depends(obtener_usuario_actual)):
        if current_user.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos suficientes para realizar esta acción"
            )
        return current_user
    return rol_dependency