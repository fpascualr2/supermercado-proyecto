export interface Proveedor {
  id?: number;
  nombre: string;
  nit: string;
  nombre_contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
  estado?: boolean;
}