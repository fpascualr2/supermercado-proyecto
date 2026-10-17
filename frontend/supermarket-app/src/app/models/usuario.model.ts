export interface Usuario {
  id?: number;
  nombre: string;
  username: string;
  password?: string;
  rol: string;
  estado?: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}