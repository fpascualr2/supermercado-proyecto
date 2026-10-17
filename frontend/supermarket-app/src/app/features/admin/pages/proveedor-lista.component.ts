import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService } from '../../../services/proveedor.service';
import { Proveedor } from '../../../models/proveedor.model';

@Component({
  selector: 'app-proveedor-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white">Gestión de Proveedores</h2>
          <p class="text-slate-400 text-sm">Administra la red de proveedores para el abastecimiento y compras.</p>
        </div>
        <button (click)="abrirModalCrear()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow">
          + Nuevo Proveedor
        </button>
      </div>

      <!-- Tabla de Proveedores -->
      <div class="overflow-x-auto border border-slate-700 rounded-xl">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
            <tr>
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">Nombre</th>
              <th class="px-6 py-3">NIT</th>
              <th class="px-6 py-3">Contacto</th>
              <th class="px-6 py-3">Teléfono</th>
              <th class="px-6 py-3">Estado</th>
              <th class="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700">
            @if (proveedores().length > 0) {
              @for (prov of proveedores(); track prov.id) {
                <tr class="hover:bg-slate-750 transition">
                  <td class="px-6 py-4 font-medium text-white">{{ prov.id }}</td>
                  <td class="px-6 py-4 text-white font-semibold">{{ prov.nombre }}</td>
                  <td class="px-6 py-4 text-indigo-400">{{ prov.nit }}</td>
                  <td class="px-6 py-4 text-slate-300">{{ prov.nombre_contacto }}</td>
                  <td class="px-6 py-4 text-slate-400">{{ prov.telefono }}</td>
                  <td class="px-6 py-4">
                    <span [class]="prov.estado !== false ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium' : 'bg-red-900/50 text-red-300 border border-red-700 px-2.5 py-1 rounded-full text-xs font-medium'">
                      {{ prov.estado !== false ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center space-x-2">
                    <button (click)="abrirModalEditar(prov)" class="text-indigo-400 hover:text-indigo-300 font-medium text-xs bg-indigo-950/60 px-3 py-1.5 rounded border border-indigo-800 transition">Editar</button>
                    <button (click)="eliminar(prov.id!)" class="text-red-400 hover:text-red-300 font-medium text-xs bg-red-950/60 px-3 py-1.5 rounded border border-red-800 transition">Eliminar</button>
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                  No hay proveedores registrados o cargando datos del servidor...
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal para Crear / Editar Proveedor -->
      @if (modalAbierto()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl my-8">
            <h3 class="text-lg font-bold text-white mb-4">
              {{ editandoId() ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor' }}
            </h3>
            
            <form (submit)="guardarProveedor($event)" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Nombre de la Empresa</label>
                  <input type="text" [(ngModel)]="proveedorActual.nombre" name="nombre" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Ej. Distribuidora S.A.">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">NIT</label>
                  <input type="text" [(ngModel)]="proveedorActual.nit" name="nit" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Ej. 1234567-8">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Nombre de Contacto</label>
                  <input type="text" [(ngModel)]="proveedorActual.nombre_contacto" name="nombre_contacto" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Ej. Lic. Carlos Pérez">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Teléfono</label>
                  <input type="text" [(ngModel)]="proveedorActual.telefono" name="telefono" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Ej. 5555-4444">
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                <input type="email" [(ngModel)]="proveedorActual.correo" name="correo" required
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. ventas@distribuidora.com">
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Dirección</label>
                <textarea [(ngModel)]="proveedorActual.direccion" name="direccion" rows="2" required
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. Zona 4, Ciudad de Guatemala"></textarea>
              </div>

              <div class="flex items-center space-x-2 pt-2">
                <input type="checkbox" [(ngModel)]="proveedorActual.estado" name="estado" id="provEstado"
                  class="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500">
                <label for="provEstado" class="text-xs font-medium text-slate-300">Proveedor Activo</label>
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
export class ProveedorListaComponent implements OnInit {
  proveedorService = inject(ProveedorService);
  proveedores = signal<Proveedor[]>([]);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);

  proveedorActual: Proveedor = {
    nombre: '',
    nit: '',
    nombre_contacto: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: true
  };

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => this.proveedores.set(data),
      error: (err) => console.error('Error al cargar proveedores:', err)
    });
  }

  abrirModalCrear() {
    this.editandoId.set(null);
    this.proveedorActual = {
      nombre: '',
      nit: '',
      nombre_contacto: '',
      telefono: '',
      correo: '',
      direccion: '',
      estado: true
    };
    this.modalAbierto.set(true);
  }

  abrirModalEditar(prov: Proveedor) {
    this.editandoId.set(prov.id!);
    this.proveedorActual = { ...prov };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.editandoId.set(null);
  }

  guardarProveedor(event: Event) {
    event.preventDefault();
    const id = this.editandoId();

    if (id !== null) {
      this.proveedorService.actualizarProveedor(id, this.proveedorActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProveedores();
        },
        error: (err) => console.error('Error al actualizar proveedor:', err)
      });
    } else {
      this.proveedorService.crearProveedor(this.proveedorActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarProveedores();
        },
        error: (err) => console.error('Error al crear proveedor:', err)
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.proveedorService.eliminarProveedor(id).subscribe({
        next: () => this.cargarProveedores(),
        error: (err) => console.error('Error al eliminar proveedor:', err)
      });
    }
  }
}