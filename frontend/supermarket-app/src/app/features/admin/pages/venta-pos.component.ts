import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { VentaService } from '../../../services/venta.service';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/producto.model';
import { DetalleVenta } from '../../../models/venta.model';

interface ItemCarrito extends DetalleVenta {
  nombreProducto: string;
  codigo: string;
  stockMax: number;
}

@Component({
  selector: 'app-venta-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-7rem)]">
      
      <!-- Columna Izquierda: Selección de Productos (Compacta) -->
      <div class="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-white">Catálogo de Productos - POS</h2>
          <span class="text-xs text-slate-400">Haz clic en un producto para agregarlo</span>
        </div>
        
        <!-- Buscador -->
        <div class="mb-4">
          <input type="text" [(ngModel)]="filtroBusqueda" placeholder="Buscar por nombre o código..."
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
        </div>

        <!-- Lista de Productos en Grid Compacto -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 items-start overflow-y-auto flex-1 pr-1">
          @for (prod of productosFiltrados(); track prod.id) {
            <div (click)="agregarAlCarrito(prod)" [title]="prod.nombre"
                class="bg-slate-900/90 border border-slate-700 hover:border-indigo-500 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between shadow-md hover:bg-slate-900 h-28">
              <div>
                <span class="text-[11px] font-semibold text-indigo-400">{{ prod.codigo }}</span>
                <h4 class="text-white font-medium text-xs mt-0.5 line-clamp-2 leading-tight">{{ prod.nombre }}</h4>
              </div>
              <div class="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span class="text-emerald-400 font-bold text-sm">Q{{ prod.precio_venta | number:'1.2-2' }}</span>
                <span class="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Stock: {{ prod.existencia }}</span>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-12 text-slate-500 text-sm">
              No se encontraron productos disponibles.
            </div>
          }
        </div>
      </div>

      <!-- Columna Derecha: Carrito, Selector de Cliente y Totales -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-xl">
        <div class="flex flex-col h-full">
          <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-700">
            <h3 class="text-md font-bold text-white">Carrito de Venta</h3>
            <span class="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              #{{ numeroTicket }}
            </span>
          </div>

          <!-- Selector de Cliente -->
          <div class="mb-3">
            <label class="block text-xs font-medium text-slate-300 mb-1">Cliente de la Venta</label>
            <select [(ngModel)]="clienteSeleccionadoId" name="cliente_id" 
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500">
              <option [value]="null" disabled>-- Seleccione un cliente --</option>
              @for (cli of clientes(); track cli.id) {
                <option [value]="cli.id">{{ cli.nombres }} {{ cli.apellidos }} (NIT: {{ cli.nit }})</option>
              }
            </select>
          </div>

          <!-- Items del Carrito -->
          <div class="overflow-y-auto max-h-[34vh] space-y-2.5 pr-1 flex-1">
            @if (carrito().length > 0) {
              @for (item of carrito(); track item.producto_id; let i = $index) {
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs">
                  <div class="flex justify-between font-semibold text-white">
                    <span class="truncate max-w-[180px]">{{ item.nombreProducto }}</span>
                    <button (click)="eliminarItem(i)" class="text-red-400 hover:text-red-300 font-bold ml-2">✕</button>
                  </div>
                  <div class="flex justify-between items-center mt-2 text-slate-400">
                    <span>Q{{ item.precio | number:'1.2-2' }}</span>
                    <div class="flex items-center space-x-1.5 bg-slate-800 px-2 py-0.5 rounded">
                      <button (click)="cambiarCantidad(i, -1)" class="text-white font-bold hover:text-indigo-400">-</button>
                      <span class="text-white font-semibold px-1">{{ item.cantidad }}</span>
                      <button (click)="cambiarCantidad(i, 1)" class="text-white font-bold hover:text-indigo-400">+</button>
                    </div>
                    <span class="text-emerald-400 font-bold">Q{{ item.subtotal | number:'1.2-2' }}</span>
                  </div>
                </div>
              }
            } @else {
              <div class="text-center py-12 text-slate-500 text-xs">
                El carrito está vacío.<br>Selecciona productos a la izquierda.
              </div>
            }
          </div>
        </div>

        <!-- Totales y Botón de Cobro -->
        <div class="border-t border-slate-700 pt-3 space-y-2.5 mt-2">
          <div class="flex justify-between text-xs text-slate-300">
            <span>Subtotal</span>
            <span>Q{{ totalVenta() | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-base font-bold text-white">
            <span>Total a Pagar</span>
            <span class="text-emerald-400">Q{{ totalVenta() | number:'1.2-2' }}</span>
          </div>

          <button (click)="procesarVenta()" [disabled]="carrito().length === 0"
            class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 rounded-xl transition shadow text-sm">
            Cobrar y Facturar
          </button>
        </div>
      </div>

    </div>
  `
})
export class VentaPosComponent implements OnInit {
  ventaService = inject(VentaService);
  productoService = inject(ProductoService);
  http = inject(HttpClient);

  productos = signal<Producto[]>([]);
  clientes = signal<any[]>([]);
  clienteSeleccionadoId = signal<number | null>(null);
  carrito = signal<ItemCarrito[]>([]);
  filtroBusqueda = '';
  numeroTicket = 'T-' + Math.floor(100000 + Math.random() * 900000);

  ngOnInit() {
    this.cargarProductos();
    this.cargarClientes();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => this.productos.set(data.filter(p => p.estado && p.existencia > 0)),
      error: (err) => console.error('Error al cargar inventario:', err)
    });
  }

  cargarClientes() {
    this.http.get<any[]>('http://172.20.10.4:8000/api/clientes/').subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  productosFiltrados = computed(() => {
    const filtro = this.filtroBusqueda.toLowerCase();
    return this.productos().filter(p => 
      p.nombre.toLowerCase().includes(filtro) || p.codigo.toLowerCase().includes(filtro)
    );
  });

  totalVenta = computed(() => {
    return this.carrito().reduce((acc, item) => acc + item.subtotal, 0);
  });

  agregarAlCarrito(prod: Producto) {
    const carritoActual = [...this.carrito()];
    const index = carritoActual.findIndex(item => item.producto_id === prod.id);

    if (index > -1) {
      if (carritoActual[index].cantidad < prod.existencia) {
        carritoActual[index].cantidad++;
        carritoActual[index].subtotal = carritoActual[index].cantidad * carritoActual[index].precio;
      } else {
        alert('Stock máximo alcanzado para este producto.');
      }
    } else {
      carritoActual.push({
        producto_id: prod.id!,
        nombreProducto: prod.nombre,
        codigo: prod.codigo,
        precio: prod.precio_venta,
        cantidad: 1,
        subtotal: prod.precio_venta,
        stockMax: prod.existencia
      });
    }
    this.carrito.set(carritoActual);
  }

  cambiarCantidad(index: number, delta: number) {
    const carritoActual = [...this.carrito()];
    const item = carritoActual[index];
    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
      this.eliminarItem(index);
      return;
    }

    if (nuevaCantidad > item.stockMax) {
      alert('No hay suficiente stock disponible.');
      return;
    }

    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * item.precio;
    this.carrito.set(carritoActual);
  }

  eliminarItem(index: number) {
    const carritoActual = [...this.carrito()];
    carritoActual.splice(index, 1);
    this.carrito.set(carritoActual);
  }

  procesarVenta() {
    if (this.carrito().length === 0) return;

    if (!this.clienteSeleccionadoId()) {
      alert('Por favor selecciona un cliente antes de cobrar la venta.');
      return;
    }

    const usuarioLogueadoStr = localStorage.getItem('usuario');
    const usuarioId = usuarioLogueadoStr ? JSON.parse(usuarioLogueadoStr).id : 2;

    const nuevaVenta = {
      numero: this.numeroTicket,
      cliente_id: Number(this.clienteSeleccionadoId()), // 👈 Ya no va en null, envía el ID real
      usuario_id: usuarioId,
      total: this.totalVenta(),
      estado: 'REGISTRADA',
      detalles: this.carrito().map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: item.subtotal
      }))
    };

    this.ventaService.crearVenta(nuevaVenta).subscribe({
      next: () => {
        alert('¡Venta cobrada y registrada con éxito!');
        this.carrito.set([]);
        this.clienteSeleccionadoId.set(null);
        this.numeroTicket = 'T-' + Math.floor(100000 + Math.random() * 900000);
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error al registrar la venta:', err);
        alert(err.error?.detail || 'Error al procesar la venta en el servidor.');
      }
    });
  }
}