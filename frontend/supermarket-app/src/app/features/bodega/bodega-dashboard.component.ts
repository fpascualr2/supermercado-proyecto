import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompraPosComponent } from '../admin/pages/compra-pos.component';
import { ProductoListaComponent } from '../admin/pages/producto-lista.component';

@Component({
  selector: 'app-bodega-dashboard',
  standalone: true,
  imports: [CommonModule, CompraPosComponent, ProductoListaComponent],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <!-- Navbar Superior de Bodega -->
      <nav class="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-md shrink-0">
        <div class="flex items-center space-x-3">
          <span class="bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">BODEGA</span>
          <h1 class="text-xl font-bold tracking-wide text-white">Control de Inventario y Abastecimiento - Supermercado</h1>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-slate-300">Bodeguero: <strong class="text-white">{{ user()?.nombre || 'Personal de Bodega' }}</strong></span>
          <button (click)="logout()" class="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition duration-200 shadow">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <!-- Pestañas de Navegación Interna para Bodega -->
      <div class="bg-slate-800/60 border-b border-slate-700/60 px-6 py-3 flex gap-3">
        <button 
          (click)="cambiarVista('compras')" 
          [class]="vistaActual() === 'compras' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
          class="text-xs font-semibold px-4 py-2 rounded-lg transition shadow">
          📦 Registrar Compras / Abastecimiento
        </button>
        <button 
          (click)="cambiarVista('inventario')" 
          [class]="vistaActual() === 'inventario' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
          class="text-xs font-semibold px-4 py-2 rounded-lg transition shadow">
          📋 Ver Inventario y Stock
        </button>
      </div>

      <!-- Contenido Dinámico según la pestaña seleccionada -->
      <main class="flex-1 p-6 max-w-[1600px] mx-auto w-full overflow-y-auto">
        @if (vistaActual() === 'compras') {
          <app-compra-pos></app-compra-pos>
        } @else {
          <app-producto-lista></app-producto-lista>
        }
      </main>
    </div>
  `
})
export class BodegaDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  user = this.authService.currentUser;
  vistaActual = signal<'compras' | 'inventario'>('compras');

  cambiarVista(vista: 'compras' | 'inventario') {
    this.vistaActual.set(vista);
  }

  logout() {
    this.authService.logout();
  }
}