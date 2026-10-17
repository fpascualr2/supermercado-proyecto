import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';

@Component({
  selector: 'app-categoria-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white">Gestión de Categorías</h2>
          <p class="text-slate-400 text-sm">Administra las categorías con código alfanumérico y ID de base de datos.</p>
        </div>
        <button (click)="abrirModalCrear()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow">
          + Nueva Categoría
        </button>
      </div>

      <!-- Tabla de Categorías -->
      <div class="overflow-x-auto border border-slate-700 rounded-xl">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
            <tr>
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">Código</th>
              <th class="px-6 py-3">Nombre</th>
              <th class="px-6 py-3">Descripción</th>
              <th class="px-6 py-3">Estado</th>
              <th class="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700">
            @if (categorias().length > 0) {
              @for (cat of categorias(); track cat.id) {
                <tr class="hover:bg-slate-750 transition">
                  <td class="px-6 py-4 font-medium text-white">{{ cat.id }}</td>
                  <td class="px-6 py-4 text-indigo-400 font-semibold">{{ cat.codigo }}</td>
                  <td class="px-6 py-4 text-white font-semibold">{{ cat.nombre }}</td>
                  <td class="px-6 py-4 text-slate-400">{{ cat.descripcion || 'Sin descripción' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="cat.estado !== false ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium' : 'bg-red-900/50 text-red-300 border border-red-700 px-2.5 py-1 rounded-full text-xs font-medium'">
                      {{ cat.estado !== false ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center space-x-2">
                    <button (click)="abrirModalEditar(cat)" class="text-indigo-400 hover:text-indigo-300 font-medium text-xs bg-indigo-950/60 px-3 py-1.5 rounded border border-indigo-800 transition">Editar</button>
                    <button (click)="eliminar(cat.id!)" class="text-red-400 hover:text-red-300 font-medium text-xs bg-red-950/60 px-3 py-1.5 rounded border border-red-800 transition">Eliminar</button>
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                  No hay categorías registradas. ¡Crea la primera!
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal para Crear / Editar Categoría -->
      @if (modalAbierto()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 class="text-lg font-bold text-white mb-4">
              {{ editandoId() ? 'Editar Categoría' : 'Registrar Nueva Categoría' }}
            </h3>
            
            <form (submit)="guardarCategoria($event)" class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Código Alfanumérico</label>
                <input type="text" [(ngModel)]="categoriaActual.codigo" name="codigo" required
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. PT-001">
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Nombre de la Categoría</label>
                <input type="text" [(ngModel)]="categoriaActual.nombre" name="nombre" required
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. Frutas">
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
                <textarea [(ngModel)]="categoriaActual.descripcion" name="descripcion" rows="2"
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. Con semilla"></textarea>
              </div>

              <div class="flex items-center space-x-2 pt-2">
                <input type="checkbox" [(ngModel)]="categoriaActual.estado" name="estado" id="estado"
                  class="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500">
                <label for="estado" class="text-xs font-medium text-slate-300">Categoría Activa</label>
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
export class CategoriaListaComponent implements OnInit {
  categoriaService = inject(CategoriaService);
  categorias = signal<Categoria[]>([]);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);

  categoriaActual: Categoria = {
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: true
  };

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  abrirModalCrear() {
    this.editandoId.set(null);
    this.categoriaActual = { codigo: '', nombre: '', descripcion: '', estado: true };
    this.modalAbierto.set(true);
  }

  abrirModalEditar(cat: Categoria) {
    this.editandoId.set(cat.id!);
    this.categoriaActual = { ...cat };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.editandoId.set(null);
  }

  guardarCategoria(event: Event) {
    event.preventDefault();
    const id = this.editandoId();

    if (id !== null) {
      this.categoriaService.actualizarCategoria(id, this.categoriaActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: (err) => console.error('Error al actualizar categoría:', err)
      });
    } else {
      this.categoriaService.crearCategoria(this.categoriaActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarCategorias();
        },
        error: (err) => console.error('Error al crear categoría:', err)
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.categoriaService.eliminarCategoria(id).subscribe({
        next: () => this.cargarCategorias(),
        error: (err) => console.error('Error al eliminar categoría:', err)
      });
    }
  }
}