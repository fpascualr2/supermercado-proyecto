from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.categoria import router as categoria_router
from app.routers.productos import router as productos_router
from app.routers.clientes import router as clientes_router
from app.routers.proveedores import router as proveedores_router
from app.routers.usuarios import router as usuarios_router
from app.routers.ventas import router as ventas_router
from app.routers.compras import router as compras_router
from app.routers.reportes import router as reportes_router

app = FastAPI(title="Supermercado Pro - API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar todos los módulos
app.include_router(categoria_router)
app.include_router(productos_router)
app.include_router(clientes_router)
app.include_router(proveedores_router)
app.include_router(usuarios_router)
app.include_router(ventas_router)
app.include_router(compras_router)
app.include_router(reportes_router)

@app.get("/")
def read_root():
    return {"mensaje": "Backend completo del Supermercado conectado a Supabase 🚀"}