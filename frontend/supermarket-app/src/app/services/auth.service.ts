import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse, Usuario } from '../models/usuario.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = 'http://172.20.10.4:8000/api/usuarios';

  // Temporizador de inactividad (10 minutos = 600,000 milisegundos)
  private inactivityTimeout: any;
  private readonly INACTIVITY_LIMIT = 10 * 60 * 1000; 

  currentUser = signal<Usuario | null>(this.getStoredUser());

  constructor() {
    if (typeof window !== 'undefined') {
      const user = this.getStoredUser();
      if (user) {
        this.currentUser.set(user);
        this.startInactivityTimer();
      }
    }
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.usuario));
        }
        this.currentUser.set(response.usuario);
        this.startInactivityTimer(); // Arrancar el contador al iniciar sesión
      })
    );
  }

  logout(motivoInactividad: boolean = false): void {
    this.clearInactivityTimer();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    
    if (motivoInactividad) {
      alert('Tu sesión ha expirado por inactividad (10 minutos sin actividad).');
    }
    
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getStoredUser(): Usuario | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  hasRole(allowedRoles: string[]): boolean {
    const user = this.currentUser();
    return user ? allowedRoles.includes(user.rol) : false;
  }

  // --- MÉTODOS DE CONTROL DE INACTIVIDAD ---

  private startInactivityTimer() {
    if (typeof window === 'undefined') return;

    // Escuchar eventos de interacción del usuario
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });

    this.resetInactivityTimer();
  }

  private resetInactivityTimer() {
    if (!this.getToken()) return; // Si no hay token, no operar

    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      this.logout(true); // Cerrar sesión por inactividad indicando true
    }, this.INACTIVITY_LIMIT);
  }

  private clearInactivityTimer() {
    if (typeof window === 'undefined') return;
    clearTimeout(this.inactivityTimeout);
    
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.removeEventListener(event, () => this.resetInactivityTimer());
    });
  }
}