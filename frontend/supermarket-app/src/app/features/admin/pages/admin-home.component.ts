import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Tarjeta: Usuarios -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-indigo-500 transition flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white mb-2">Gestión de Usuarios</h2>
          <p class="text-slate-400 text-sm">Controla los accesos y crea perfiles de administrador, bodega y cajeros.</p>
        </div>
        <div class="mt-6">
          <a routerLink="usuarios" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Administrar Usuarios
          </a>
        </div>
      </div>

      <!-- Tarjeta: Categorías -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-indigo-500 transition flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white mb-2">Categorías</h2>
          <p class="text-slate-400 text-sm">Gestiona las clasificaciones necesarias para el inventario de productos.</p>
        </div>
        <div class="mt-6">
          <a routerLink="categorias" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Ver Categorías
          </a>
        </div>
      </div>

      <!-- Tarjeta: Inventario -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-indigo-500 transition flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white mb-2">Inventario y Productos</h2>
          <p class="text-slate-400 text-sm">Administra el stock, precios, categorías y proveedores de todo el supermercado.</p>
        </div>
        <div class="mt-6">
          <a routerLink="productos" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Ver Inventario
          </a>
        </div>
      </div>

      <!-- Tarjeta: Clientes -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500 transition">
        <div>
          <h3 class="text-lg font-bold text-white mb-2">Clientes</h3>
          <p class="text-slate-400 text-xs mb-4">Administra la base de datos de clientes y sus datos de facturación (NIT).</p>
        </div>
        <div> <!-- Contenedor para alinear el botón igual que las demás tarjetas -->
          <a routerLink="/admin/clientes" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
            Gestionar Clientes
          </a>
        </div>
      </div>

      <!-- Tarjeta: Proveedores -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-indigo-500 transition flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white mb-2">Proveedores</h2>
          <p class="text-slate-400 text-sm">Administra la red de proveedores para el abastecimiento y compras.</p>
        </div>
        <div class="mt-6">
          <a routerLink="proveedores" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Ver Proveedores
          </a>
        </div>
      </div>

      <!-- Tarjeta: Ventas / POS -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-indigo-500 transition flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white mb-2">Ventas y POS</h2>
          <p class="text-slate-400 text-sm">Gestiona el punto de venta, carrito y registro de transacciones.</p>
        </div>
        <div class="mt-6">
          <a routerLink="ventas" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Abrir POS
          </a>
        </div>
      </div>

      <!-- Tarjeta: Compras / Abastecimiento -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-indigo-500 transition flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white mb-2">Compras y Abastecimiento</h2>
          <p class="text-slate-400 text-sm">Registra órdenes de compra a proveedores y aumenta el stock automáticamente.</p>
        </div>
        <div class="mt-6">
          <a routerLink="compras" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Gestionar Compras
          </a>
        </div>
      </div>

      <!-- Tarjeta: Reportes -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-indigo-500 transition flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white mb-2">Reportes</h2>
          <p class="text-slate-400 text-sm">Supervisa las transacciones en tiempo real y el flujo de caja general.</p>
        </div>
        <div class="mt-6">
          <a routerLink="reportes" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Ver Reportes
          </a>
        </div>
      </div>

    </div>
  `
})
export class AdminHomeComponent {}