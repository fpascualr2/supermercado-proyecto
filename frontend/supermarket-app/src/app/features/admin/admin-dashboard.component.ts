import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <!-- Navbar Superior Fija con Botón de Retorno Dinámico -->
      <nav class="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-md shrink-0">
        <div class="flex items-center space-x-4">
          <span class="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">ADMIN</span>
          
          <!-- Botón de Regresar que aparece automáticamente en las sub-vistas -->
          @if (esSubvista()) {
            <a routerLink="/admin" class="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow">
              ← Menú Principal
            </a>
          }

          <h1 class="text-xl font-bold tracking-wide text-white">Panel de Administración - Supermercado</h1>
        </div>

        <div class="flex items-center space-x-4">
          <span class="text-sm text-slate-300">Hola, <strong class="text-white">{{ user()?.nombre || 'Administrador' }}</strong></span>
          <button (click)="logout()" class="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition duration-200 shadow">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <!-- Contenido Principal Dinámico -->
      <main class="flex-1 p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  user = this.authService.currentUser;
  esSubvista = signal(false);

  constructor() {
    this.esSubvista.set(this.router.url !== '/admin');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.esSubvista.set(event.urlAfterRedirects !== '/admin');
    });
  }

  logout() {
    this.authService.logout();
  }
}