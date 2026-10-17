export interface DetalleCompra {
  id?: number;
  producto_id: number;
  cantidad: number;
  precio_compra: number;
  subtotal?: number;
}

export interface Compra {
  id?: number;
  numero: string;
  proveedor_id: number;
  fecha?: string;
  usuario_id: number;
  total: number;
  estado?: string;
  detalles: DetalleCompra[];
}