import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { AuthService } from '../../../services/auth.service';
import { Producto } from '../../../models/producto.model';
import { Categoria } from '../../../models/categoria.model';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white">Gestión de Inventario y Productos</h2>
          <p class="text-slate-400 text-sm">Administra el stock, precios y categorías conectados a FastAPI.</p>
        </div>
        
        <!-- Botón de Nuevo Producto (Visible solo para Administradores) -->
        @if (isAdmin()) {
          <button (click)="abrirModalCrear()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow">
            + Nuevo Producto
          </button>
        }
      </div>

      <!-- Tabla de Datos -->
      <div class="overflow-x-auto border border-slate-700 rounded-xl">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
            <tr>
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">Código</th>
              <th class="px-6 py-3">Nombre</th>
              <th class="px-6 py-3">P. Venta</th>
              <th class="px-6 py-3">Existencia</th>
              <th class="px-6 py-3">Estado</th>
              <th class="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700">
            @if (productos().length > 0) {
              @for (prod of productos(); track prod.id) {
                <tr class="hover:bg-slate-750 transition">
                  <td class="px-6 py-4 font-medium text-white">{{ prod.id }}</td>
                  <td class="px-6 py-4 text-indigo-400 font-semibold">{{ prod.codigo }}</td>
                  <td class="px-6 py-4 text-white font-semibold">{{ prod.nombre }}</td>
                  <td class="px-6 py-4 text-emerald-400">Q{{ prod.precio_venta | number:'1.2-2' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="prod.existencia > prod.stock_minimo ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium' : 'bg-red-900/50 text-red-300 border border-red-700 px-2.5 py-1 rounded-full text-xs font-medium'">
                      {{ prod.existencia }} unids
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="prod.estado ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium' : 'bg-red-900/50 text-red-300 border border-red-700 px-2.5 py-1 rounded-full text-xs font-medium'">
                      {{ prod.estado ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center space-x-2">
                    <!-- Acciones restringidas por rol -->
                    @if (isAdmin()) {
                      <button (click)="abrirModalEditar(prod)" class="text-indigo-400 hover:text-indigo-300 font-medium text-xs bg-indigo-950/60 px-3 py-1.5 rounded border border-indigo-800 transition">Editar</button>
                      <button (click)="eliminar(prod.id!)" class="text-red-400 hover:text-red-300 font-medium text-xs bg-red-950/60 px-3 py-1.5 rounded border border-red-800 transition">Eliminar</button>
                    } @else {
                      <span class="text-slate-500 text-xs italic bg-slate-900/60 px-3 py-1 rounded border border-slate-800">Solo lectura</span>
                    }
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                  No hay productos registrados o cargando datos del servidor...
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal para Crear / Editar Producto (Solo accesible por Admin) -->
      @if (modalAbierto() && isAdmin()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl my-8">
            <h3 class="text-lg font-bold text-white mb-4">
              {{ editandoId() ? 'Editar Producto' : 'Registrar Nuevo Producto' }}
            </h3>
            
            <form (submit)="guardarProducto($event)" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Código</label>
                  <input type="text" [(ngModel)]="productoActual.codigo" name="codigo" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Ej. PRD-001">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
                  <select [(ngModel)]="productoActual.categoria_id" name="categoria_id" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                    <option [value]="0" disabled>Seleccione categoría</option>
                    @for (cat of categorias(); track cat.id) {
                      <option [value]="cat.id">{{ cat.nombre }}</option>
                    }
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Nombre del Producto</label>
                <input type="text" [(ngModel)]="productoActual.nombre" name="nombre" required
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. Manzana Roja">
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
                <textarea [(ngModel)]="productoActual.descripcion" name="descripcion" rows="2"
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. Producto fresco importado"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Precio Compra (Q)</label>
                  <input type="number" step="0.01" [(ngModel)]="productoActual.precio_compra" name="precio_compra" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Precio Venta (Q)</label>
                  <input type="number" step="0.01" [(ngModel)]="productoActual.precio_venta" name="precio_venta" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Existencia (Stock)</label>
                  <input type="number" [(ngModel)]="productoActual.existencia" name="existencia" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Stock Mínimo</label>
                  <input type="number" [(ngModel)]="productoActual.stock_minimo" name="stock_minimo" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                </div>
              </div>

              <div class="flex items-center space-x-2 pt-2">
                <input type="checkbox" [(ngModel)]="productoActual.estado" name="estado" id="prodEstado"
                  class="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500">
                <label for="prodEstado" class="text-xs font-medium text-slate-300">Producto Activo</label>
              </div>

              <div class="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                <button type="button" (click)="cerrarModal()" class="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition">
                  Cancelar
                </button>
                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                  {{ editandoId() ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductoListaComponent implements OnInit {
  productoService = inject(ProductoService);
  authService = inject(AuthService);

  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);

  // Computed para verificar si el rol actual es ADMINISTRADOR
  isAdmin = computed(() => this.authService.currentUser()?.rol === 'ADMIN');

  productoActual: Producto = {
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: 0,
    precio_compra: 0,
    precio_venta: 0,
    existencia: 0,
    stock_minimo: 0,
    estado: true
  };

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (data) => this.productos.set(data),
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  cargarCategorias() {
    this.productoService.getCategorias().subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  abrirModalCrear() {
    if (!this.isAdmin()) return;
    this.editandoId.set(null);
    this.productoActual = {
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria_id: 0,
      precio_compra: 0,
      precio_venta: 0,
      existencia: 0,
      stock_minimo: 0,
      estado: true
    };
    this.modalAbierto.set(true);
  }

  abrirModalEditar(prod: Producto) {
    if (!this.isAdmin()) return;
    this.editandoId.set(prod.id!);
    this.productoActual = { ...prod };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.editandoId.set(null);
  }

  guardarProducto(event: Event) {
    event.preventDefault();
    if (!this.isAdmin()) return;

    if (!this.productoActual.categoria_id) {
      alert('Por favor selecciona una categoría.');
      return;
    }

    const id = this.editandoId();

    if (id !== null) {
      this.productoService.actualizarProducto(id, this.productoActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProductos();
        },
        error: (err) => console.error('Error al actualizar producto:', err)
      });
    } else {
      this.productoService.crearProducto(this.productoActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProductos();
        },
        error: (err) => console.error('Error al crear producto:', err)
      });
    }
  }

  eliminar(id: number) {
    if (!this.isAdmin()) return;

    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => this.cargarProductos(),
        error: (err) => console.error('Error al eliminar producto:', err)
      });
    }
  }
}