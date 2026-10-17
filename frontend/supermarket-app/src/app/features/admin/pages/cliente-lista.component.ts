import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Cliente {
  id?: number;
  nombres: string;
  apellidos: string;
  nit: string;
  telefono: string;
  correo: string;
  direccion: string;
}

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-10">
      <!-- Cabecera -->
      <div class="flex justify-between items-center bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
        <div>
          <h2 class="text-xl font-bold text-white">Gestión de Clientes</h2>
          <p class="text-xs text-slate-400 mt-0.5">Administra la base de datos de clientes conectados a FastAPI.</p>
        </div>
        <button (click)="abrirModalCrear()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow">
          + Nuevo Cliente
        </button>
      </div>

      <!-- Tabla de Clientes -->
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-900 text-slate-400 uppercase text-[10px]">
            <tr>
              <th class="p-3 rounded-l-lg">ID</th>
              <th class="p-3">Nombres y Apellidos</th>
              <th class="p-3">NIT</th>
              <th class="p-3">Teléfono</th>
              <th class="p-3">Correo</th>
              <th class="p-3">Dirección</th>
              <th class="p-3 text-right rounded-r-lg">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            @for (cli of clientes(); track cli.id) {
              <tr class="hover:bg-slate-750">
                <td class="p-3 font-semibold text-indigo-400">{{ cli.id }}</td>
                <td class="p-3 font-medium text-white">{{ cli.nombres }} {{ cli.apellidos }}</td>
                <td class="p-3 text-cyan-300 font-semibold">{{ cli.nit }}</td>
                <td class="p-3 text-slate-300">{{ cli.telefono }}</td>
                <td class="p-3 text-slate-300">{{ cli.correo }}</td>
                <td class="p-3 text-slate-400 truncate max-w-xs">{{ cli.direccion }}</td>
                <td class="p-3 text-right space-x-2">
                  <button (click)="abrirModalEditar(cli)" class="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-2.5 py-1 rounded text-xs transition">Editar</button>
                  <button (click)="eliminar(cli.id!)" class="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-2.5 py-1 rounded text-xs transition">Eliminar</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="text-center py-8 text-slate-500">
                  No hay clientes registrados en el sistema.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal Crear / Editar Cliente -->
      @if (modalAbierto()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl my-8">
            <h3 class="text-lg font-bold text-white mb-4">
              {{ editandoId() ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}
            </h3>

            <form (submit)="guardarCliente($event)" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Nombres</label>
                  <input type="text" [(ngModel)]="clienteActual.nombres" name="nombres" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Apellidos</label>
                  <input type="text" [(ngModel)]="clienteActual.apellidos" name="apellidos" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">NIT</label>
                  <input type="text" [(ngModel)]="clienteActual.nit" name="nit" required
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Ej. 123456-7 o CF">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Teléfono</label>
                  <input type="text" [(ngModel)]="clienteActual.telefono" name="telefono"
                    class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Ej. 5555-5555">
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                <input type="email" [(ngModel)]="clienteActual.correo" name="correo"
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="correo@ejemplo.com">
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Dirección</label>
                <textarea [(ngModel)]="clienteActual.direccion" name="direccion" rows="2"
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ciudad, Zona, etc."></textarea>
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
export class ClienteListaComponent implements OnInit {
  http = inject(HttpClient);
  clientes = signal<Cliente[]>([]);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);

  clienteActual: Cliente = {
    nombres: '',
    apellidos: '',
    nit: '',
    telefono: '',
    correo: '',
    direccion: ''
  };

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.http.get<Cliente[]>('http://172.20.10.4:8000/api/clientes/').subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  abrirModalCrear() {
    this.editandoId.set(null);
    this.clienteActual = { nombres: '', apellidos: '', nit: '', telefono: '', correo: '', direccion: '' };
    this.modalAbierto.set(true);
  }

  abrirModalEditar(cli: Cliente) {
    this.editandoId.set(cli.id!);
    this.clienteActual = { ...cli };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.editandoId.set(null);
  }

  guardarCliente(event: Event) {
    event.preventDefault();
    const id = this.editandoId();

    if (id !== null) {
      this.http.put(`http://172.20.10.4:8000/api/clientes/${id}`, this.clienteActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarClientes();
        },
        error: (err) => alert(err.error?.detail || 'Error al actualizar cliente')
      });
    } else {
      this.http.post('http://172.20.10.4:8000/api/clientes/', this.clienteActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarClientes();
        },
        error: (err) => alert(err.error?.detail || 'Error al registrar cliente')
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.http.delete(`http://172.20.10.4:8000/api/clientes/${id}`).subscribe({
        next: () => this.cargarClientes(),
        error: (err) => alert(err.error?.detail || 'Error al eliminar cliente')
      });
    }
  }
}