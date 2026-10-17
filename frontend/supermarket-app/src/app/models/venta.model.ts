export interface DetalleVenta {
  producto_id: number;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface VentaCreate {
  numero: string;
  cliente_id?: number | null;
  usuario_id: number;
  total: number;
  estado: string; // ej. 'COMPLETADA'
  detalles: DetalleVenta[];
}

export interface VentaResponse {
  id: number;
  numero: string;
  fecha: string;
  total: number;
  estado: string;
}