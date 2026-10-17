import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VentaPosComponent } from '../admin/pages/venta-pos.component';

@Component({
  selector: 'app-cajero-dashboard',
  standalone: true,
  imports: [CommonModule, VentaPosComponent],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <!-- Navbar Superior del Cajero -->
      <nav class="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-md shrink-0">
        <div class="flex items-center space-x-3">
          <span class="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">CAJERO</span>
          <h1 class="text-xl font-bold tracking-wide text-white">Punto de Venta - Supermercado</h1>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-slate-300">Cajero: <strong class="text-white">{{ user()?.nombre || 'Cajero' }}</strong></span>
          <button (click)="logout()" class="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition duration-200 shadow">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <!-- Contenido Principal: POS Integrado -->
      <main class="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-y-auto">
        <app-venta-pos></app-venta-pos>
      </main>
    </div>
  `
})
export class CajeroDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  user = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}