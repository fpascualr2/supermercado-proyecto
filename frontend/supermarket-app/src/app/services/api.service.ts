import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://172.20.10.4:8000/api';

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // --- Sesión ---
  getUsuarioSesion(): any {
    if (this.isBrowser()) {
      const saved = localStorage.getItem('usuario_logueado');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }

  guardarSesion(usuario: any): void {
    if (this.isBrowser()) {
      localStorage.setItem('usuario_logueado', JSON.stringify(usuario));
    }
  }

  cerrarSesion(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('usuario_logueado');
    }
  }

  // --- Endpoints FastAPI ---
  login(credenciales: { usuario: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  getProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos`);
  }

  createProducto(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos`, data);
  }

  updateProducto(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/productos/${id}`, data);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/productos/${id}`);
  }

  getCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias`);
  }

  createCategoria(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, data);
  }

  getClientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes`);
  }

  createCliente(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes`, data);
  }

  getProveedores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proveedores`);
  }

  createProveedor(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/proveedores`, data);
  }

  realizarVenta(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventas`, data);
  }

  registrarCompra(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/compras`, data);
  }
}