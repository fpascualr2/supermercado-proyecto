import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white">Gestión de Usuarios y Accesos</h2>
          <p class="text-slate-400 text-sm">Controla los perfiles de administrador, personal de bodega y cajeros.</p>
        </div>
        <button (click)="abrirModalCrear()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow">
          + Nuevo Usuario
        </button>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="overflow-x-auto border border-slate-700 rounded-xl">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
            <tr>
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">Nombre</th>
              <th class="px-6 py-3">Usuario</th>
              <th class="px-6 py-3">Rol</th>
              <th class="px-6 py-3">Estado</th>
              <th class="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700">
            @if (usuarios().length > 0) {
              @for (usr of usuarios(); track usr.id) {
                <tr class="hover:bg-slate-750 transition">
                  <td class="px-6 py-4 font-medium text-white">{{ usr.id }}</td>
                  <td class="px-6 py-4 text-white font-semibold">{{ usr.nombre }}</td>
                  <td class="px-6 py-4 text-indigo-400">{{ usr.username }}</td>
                  <td class="px-6 py-4">
                    <span class="bg-indigo-950/60 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full text-xs font-medium uppercase">
                      {{ usr.rol }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="usr.estado !== false ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium' : 'bg-red-900/50 text-red-300 border border-red-700 px-2.5 py-1 rounded-full text-xs font-medium'">
                      {{ usr.estado !== false ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center space-x-2">
                    <button (click)="abrirModalEditar(usr)" class="text-indigo-400 hover:text-indigo-300 font-medium text-xs bg-indigo-950/60 px-3 py-1.5 rounded border border-indigo-800 transition">Editar</button>
                    <button (click)="eliminar(usr.id!)" class="text-red-400 hover:text-red-300 font-medium text-xs bg-red-950/60 px-3 py-1.5 rounded border border-red-800 transition">Eliminar</button>
                  </td>
                </tr>
              }
            } @else {
              <tr>
                <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                  No hay usuarios registrados o cargando datos del servidor...
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal para Crear / Editar Usuario -->
      @if (modalAbierto()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl my-8">
            <h3 class="text-lg font-bold text-white mb-4">
              {{ editandoId() ? 'Editar Usuario' : 'Registrar Nuevo Usuario' }}
            </h3>
            
            <form (submit)="guardarUsuario($event)" class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                <input type="text" [(ngModel)]="usuarioActual.nombre" name="nombre" required
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. Juan Pérez">
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Nombre de Usuario (Username)</label>
                <input type="text" [(ngModel)]="usuarioActual.username" name="username" required
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Ej. juanp">
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  Contraseña {{ editandoId() ? '(Dejar en blanco para mantener)' : '' }}
                </label>
                <input type="password" [(ngModel)]="usuarioActual.password" name="password" [required]="!editandoId()"
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••">
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Rol del Sistema</label>
                <select [(ngModel)]="usuarioActual.rol" name="rol" required
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                  <option value="" disabled>Seleccione un rol</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="BODEGA">BODEGA</option>
                  <option value="CAJERO">CAJERO</option>
                </select>
              </div>

              <div class="flex items-center space-x-2 pt-2">
                <input type="checkbox" [(ngModel)]="usuarioActual.estado" name="estado" id="usrEstado"
                  class="w-4 h-4 bg-slate-900 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500">
                <label for="usrEstado" class="text-xs font-medium text-slate-300">Usuario Activo</label>
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
export class UsuarioListaComponent implements OnInit {
  usuarioService = inject(UsuarioService);
  usuarios = signal<Usuario[]>([]);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);

  usuarioActual: Usuario = {
    nombre: '',
    username: '',
    password: '',
    rol: 'CAJERO',
    estado: true
  };

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  abrirModalCrear() {
    this.editandoId.set(null);
    this.usuarioActual = { nombre: '', username: '', password: '', rol: 'CAJERO', estado: true };
    this.modalAbierto.set(true);
  }

  abrirModalEditar(usr: Usuario) {
    this.editandoId.set(usr.id!);
    this.usuarioActual = { ...usr, password: '' };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.editandoId.set(null);
  }

  guardarUsuario(event: Event) {
    event.preventDefault();
    const id = this.editandoId();

    if (id !== null) {
      const payload: any = { ...this.usuarioActual };
      if (!payload.password) {
        delete payload.password;
      }

      this.usuarioService.actualizarUsuario(id, payload).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => console.error('Error al actualizar usuario:', err)
      });
    } else {
      this.usuarioService.crearUsuario(this.usuarioActual).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarUsuarios();
        },
        error: (err) => console.error('Error al crear usuario:', err)
      });
    }
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => console.error('Error al eliminar usuario:', err)
      });
    }
  }
}