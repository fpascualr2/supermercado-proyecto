import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-reporte-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-10">
      <!-- Cabecera con Botones de Exportación -->
      <div class="flex justify-between items-center bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
        <div>
          <h2 class="text-xl font-bold text-white">Panel de Reportes y Estadísticas</h2>
          <p class="text-xs text-slate-400 mt-0.5">Supervisa el flujo general de caja, transacciones y estado del inventario en tiempo real.</p>
        </div>
        <div class="flex space-x-3">
          <button (click)="descargarExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow flex items-center space-x-2">
            <span>📊 Descargar Excel</span>
          </button>
          <button (click)="imprimirPDF()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow flex items-center space-x-2">
            <span>📄 Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      <!-- Sección de KPIs y Resumen -->
      @if (datosDashboard()) {
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
            <span class="text-xs text-slate-400 uppercase font-semibold">Ventas Totales</span>
            <h3 class="text-2xl font-bold text-emerald-400 mt-2">Q{{ datosDashboard().kpis.totalVentasMonto | number:'1.2-2' }}</h3>
            <span class="text-[10px] text-slate-500 mt-1 block">{{ datosDashboard().kpis.cantidadVentas }} tickets registrados</span>
          </div>

          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
            <span class="text-xs text-slate-400 uppercase font-semibold">Inversión en Compras</span>
            <h3 class="text-2xl font-bold text-indigo-400 mt-2">Q{{ datosDashboard().kpis.totalComprasMonto | number:'1.2-2' }}</h3>
            <span class="text-[10px] text-slate-500 mt-1 block">{{ datosDashboard().kpis.cantidadCompras }} órdenes registradas</span>
          </div>

          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
            <span class="text-xs text-slate-400 uppercase font-semibold">Flujo Neto / Margen</span>
            <h3 class="text-2xl font-bold text-cyan-400 mt-2">Q{{ datosDashboard().kpis.gananciaBruta | number:'1.2-2' }}</h3>
            <span class="text-[10px] text-slate-500 mt-1 block">Ventas - Compras</span>
          </div>

          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
            <span class="text-xs text-slate-400 uppercase font-semibold">Alertas de Stock</span>
            <h3 class="text-2xl font-bold text-amber-400 mt-2">{{ datosDashboard().stockBajo.length }}</h3>
            <span class="text-[10px] text-slate-500 mt-1 block">Prod. bajos</span>
          </div>
        </div>

        <!-- Alerta de Stock Crítico -->
        @if (datosDashboard().stockBajo.length > 0) {
          <div class="bg-amber-950/40 border border-amber-600/50 rounded-xl p-5 shadow-xl">
            <h3 class="text-sm font-bold text-amber-400 mb-3">⚠️ Productos con Stock Crítico (Menor o igual a 5 unidades)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              @for (prod of datosDashboard().stockBajo; track prod.id) {
                <div class="bg-slate-900 border border-amber-800/40 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <h4 class="text-white text-xs font-semibold">{{ prod.nombre }}</h4>
                    <span class="text-[10px] text-slate-400">Código: {{ prod.codigo }}</span>
                  </div>
                  <span class="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">{{ prod.existencia }} un.</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Tablas Inferiores: Últimas Ventas y Últimas Compras -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Últimas Ventas Registradas -->
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
            <h3 class="text-sm font-bold text-white mb-4">Últimas Ventas Registradas</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-700 text-[11px] text-slate-400 uppercase">
                    <th class="py-2 px-3">Ticket</th>
                    <th class="py-2 px-3">Fecha</th>
                    <th class="py-2 px-3">Items</th>
                    <th class="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/50 text-xs">
                  @for (v of datosDashboard().ventasRecientes; track v.id) {
                    <tr class="hover:bg-slate-700/30 transition">
                      <td class="py-3 px-3 font-medium text-cyan-400">{{ v.numero }}</td>
                      <td class="py-3 px-3 text-slate-300">{{ v.fecha | date:'medium' }}</td>
                      <td class="py-3 px-3 text-slate-300">{{ v.detallesCount }} prod.</td>
                      <td class="py-3 px-3 text-right font-bold text-emerald-400">Q{{ v.total | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Últimas Compras a Proveedores -->
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
            <h3 class="text-sm font-bold text-white mb-4">Últimas Compras a Proveedores</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-700 text-[11px] text-slate-400 uppercase">
                    <th class="py-2 px-3">Orden</th>
                    <th class="py-2 px-3">Proveedor</th>
                    <th class="py-2 px-3">Fecha</th>
                    <th class="py-2 px-3 text-right">Total Inversión</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/50 text-xs">
                  @for (c of datosDashboard().comprasRecientes; track c.id) {
                    <tr class="hover:bg-slate-700/30 transition">
                      <td class="py-3 px-3 font-medium text-indigo-400">{{ c.numero }}</td>
                      <td class="py-3 px-3 text-slate-300">{{ c.proveedor }}</td>
                      <td class="py-3 px-3 text-slate-300">{{ c.fecha | date:'medium' }}</td>
                      <td class="py-3 px-3 text-right font-bold text-indigo-400">Q{{ c.total | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-20 text-slate-500 text-sm">
          Cargando métricas y estadísticas del sistema...
        </div>
      }
    </div>
  `
})
export class ReporteDashboardComponent implements OnInit {
  http = inject(HttpClient);
  datosDashboard = signal<any>(null);

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.http.get<any>('http://172.20.10.4:8000/api/reportes/dashboard').subscribe({
      next: (data) => this.datosDashboard.set(data),
      error: (err) => console.error('Error al cargar reporte:', err)
    });
  }

  descargarExcel() {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get('http://172.20.10.4:8000/api/reportes/exportar-excel', {
      headers: headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_inventario.xlsx'; 
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar Excel:', err);
        alert('No se pudo descargar el reporte. Verifique sus permisos de administrador.');
      }
    });
  }

  imprimirPDF() {
    window.print();
  }
}