export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  precio_compra: number;
  precio_venta: number;
  existencia: number;
  stock_minimo: number;
  estado: boolean;
}