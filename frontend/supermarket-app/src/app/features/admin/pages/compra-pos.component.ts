import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../../services/compra.service';
import { ProductoService } from '../../../services/producto.service';
import { ProveedorService } from '../../../services/proveedor.service';
import { Producto } from '../../../models/producto.model';
import { Proveedor } from '../../../models/proveedor.model';
import { DetalleCompra } from '../../../models/compra.model';

interface ItemCarritoCompra extends DetalleCompra {
  nombreProducto: string;
  codigo: string;
}

@Component({
  selector: 'app-compra-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-7rem)]">
      
      <!-- Columna Izquierda: Catálogo y Selección de Proveedor -->
      <div class="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col shadow-xl">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div>
            <h2 class="text-lg font-bold text-white">Recepción de Mercadería - Compras</h2>
            <span class="text-xs text-slate-400">Selecciona el proveedor y haz clic en los productos para abastecer</span>
          </div>
          <!-- Selector de Proveedor -->
          <select [(ngModel)]="proveedorSeleccionadoId" 
            class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500">
            <option [value]="0" disabled>-- Seleccione Proveedor -- prov</option>
            @for (prov of proveedores(); track prov.id) {
              <option [value]="prov.id">{{ prov.nombre }} (NIT: {{ prov.nit }})</option>
            }
          </select>
        </div>
        
        <!-- Buscador -->
        <div class="mb-4">
          <input type="text" [(ngModel)]="filtroBusqueda" placeholder="Buscar producto para reabastecer..."
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
        </div>

        <!-- Lista de Productos Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 items-start overflow-y-auto flex-1 pr-1">
          @for (prod of productosFiltrados(); track prod.id) {
            <div (click)="agregarAlCarrito(prod)" [title]="prod.nombre"
                class="bg-slate-900/90 border border-slate-700 hover:border-indigo-500 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between shadow-md hover:bg-slate-900 h-28">
              <div>
                <span class="text-[11px] font-semibold text-indigo-400">{{ prod.codigo }}</span>
                <h4 class="text-white font-medium text-xs mt-0.5 line-clamp-2 leading-tight">{{ prod.nombre }}</h4>
              </div>
              <div class="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span class="text-emerald-400 font-bold text-xs">Costo: Q{{ prod.precio_compra | number:'1.2-2' }}</span>
                <span class="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Stock: {{ prod.existencia }}</span>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-12 text-slate-500 text-sm">
              No se encontraron productos.
            </div>
          }
        </div>
      </div>

      <!-- Columna Derecha: Resumen de Compra -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-xl">
        <div>
          <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
            <h3 class="text-md font-bold text-white">Orden de Compra</h3>
            <span class="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              #{{ numeroOrden }}
            </span>
          </div>

          <!-- Items del Carrito de Compra -->
          <div class="overflow-y-auto max-h-[40vh] space-y-2.5 pr-1">
            @if (carrito().length > 0) {
              @for (item of carrito(); track item.producto_id; let i = $index) {
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs">
                  <div class="flex justify-between font-semibold text-white">
                    <span class="truncate max-w-[160px]">{{ item.nombreProducto }}</span>
                    <button (click)="eliminarItem(i)" class="text-red-400 hover:text-red-300 font-bold ml-2">✕</button>
                  </div>
                  <div class="mt-2 flex justify-between items-center text-slate-400">
                    <div>
                      <span class="text-[10px] block">Costo Unit.:</span>
                      <input type="number" [(ngModel)]="item.precio_compra" (ngModelChange)="actualizarSubtotal(i)" min="0" step="0.01"
                        class="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white text-xs">
                    </div>
                    <div>
                      <span class="text-[10px] block">Cant:</span>
                      <div class="flex items-center space-x-1 bg-slate-800 px-1.5 py-0.5 rounded">
                        <button (click)="cambiarCantidad(i, -1)" class="text-white font-bold hover:text-indigo-400">-</button>
                        <span class="text-white font-semibold px-1">{{ item.cantidad }}</span>
                        <button (click)="cambiarCantidad(i, 1)" class="text-white font-bold hover:text-indigo-400">+</button>
                      </div>
                    </div>
                  </div>
                  <div class="mt-2 text-right text-emerald-400 font-bold">
                    Subtotal: Q{{ (item.cantidad * item.precio_compra) | number:'1.2-2' }}
                  </div>
                </div>
              }
            } @else {
              <div class="text-center py-16 text-slate-500 text-xs">
                No hay productos en la orden.<br>Selecciona productos a la izquierda.
              </div>
            }
          </div>
        </div>

        <!-- Totales y Botón de Registro -->
        <div class="border-t border-slate-700 pt-3 space-y-2.5">
          <div class="flex justify-between text-base font-bold text-white">
            <span>Total Inversión</span>
            <span class="text-emerald-400">Q{{ totalCompra() | number:'1.2-2' }}</span>
          </div>

          <button (click)="procesarCompra()" [disabled]="carrito().length === 0 || proveedorSeleccionadoId === 0"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2.5 rounded-xl transition shadow text-sm">
            Registrar Compra e Ingresar a Stock
          </button>
        </div>
      </div>

    </div>
  `
})
export class CompraPosComponent implements OnInit {
  compraService = inject(CompraService);
  productoService = inject(ProductoService);
  proveedorService = inject(ProveedorService);

  productos = signal<Producto[]>([]);
  proveedores = signal<Proveedor[]>([]);
  carrito = signal<ItemCarritoCompra[]>([]);
  
  filtroBusqueda = '';
  proveedorSeleccionadoId = 0;
  numeroOrden = 'OC-' + Math.floor(100000 + Math.random() * 900000);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.productoService.getProductos().subscribe({
      next: (data) => this.productos.set(data.filter(p => p.estado)),
      error: (err) => console.error('Error al cargar productos:', err)
    });

    this.proveedorService.getProveedores().subscribe({
      next: (data) => this.proveedores.set(data.filter(p => p.estado)),
      error: (err) => console.error('Error al cargar proveedores:', err)
    });
  }

  productosFiltrados = computed(() => {
    const filtro = this.filtroBusqueda.toLowerCase();
    return this.productos().filter(p => 
      p.nombre.toLowerCase().includes(filtro) || p.codigo.toLowerCase().includes(filtro)
    );
  });

  totalCompra = computed(() => {
    return this.carrito().reduce((acc, item) => acc + (item.cantidad * item.precio_compra), 0);
  });

  agregarAlCarrito(prod: Producto) {
    const carritoActual = [...this.carrito()];
    const index = carritoActual.findIndex(item => item.producto_id === prod.id);

    if (index > -1) {
      carritoActual[index].cantidad++;
    } else {
      carritoActual.push({
        producto_id: prod.id!,
        nombreProducto: prod.nombre,
        codigo: prod.codigo,
        cantidad: 1,
        precio_compra: prod.precio_compra
      });
    }
    this.carrito.set(carritoActual);
  }

  cambiarCantidad(index: number, delta: number) {
    const carritoActual = [...this.carrito()];
    const nuevaCantidad = carritoActual[index].cantidad + delta;
    if (nuevaCantidad <= 0) {
      this.eliminarItem(index);
      return;
    }
    carritoActual[index].cantidad = nuevaCantidad;
    this.carrito.set(carritoActual);
  }

  actualizarSubtotal(index: number) {
    this.carrito.set([...this.carrito()]);
  }

  eliminarItem(index: number) {
    const carritoActual = [...this.carrito()];
    carritoActual.splice(index, 1);
    this.carrito.set(carritoActual);
  }

  procesarCompra() {
    if (this.carrito().length === 0 || this.proveedorSeleccionadoId === 0) return;

    const usuarioLogueadoStr = localStorage.getItem('usuario');
    const usuarioId = usuarioLogueadoStr ? JSON.parse(usuarioLogueadoStr).id : 2;

    const nuevaCompra = {
      numero: this.numeroOrden,
      proveedor_id: Number(this.proveedorSeleccionadoId),
      usuario_id: usuarioId,
      total: this.totalCompra(),
      estado: 'REGISTRADA',
      detalles: this.carrito().map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_compra: Number(item.precio_compra)
      }))
    };

    this.compraService.crearCompra(nuevaCompra as any).subscribe({
      next: () => {
        alert('¡Compra registrada e inventario actualizado con éxito!');
        this.carrito.set([]); // 👈 Aquí pasamos el arreglo vacío []
        this.numeroOrden = 'OC-' + Math.floor(100000 + Math.random() * 900000);
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al registrar la compra:', err);
        alert('Error al procesar la orden de compra en el servidor.');
      }
    });
  }
}