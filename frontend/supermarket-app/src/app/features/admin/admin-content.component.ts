import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-12">
      <h3 class="text-xl font-bold text-white mb-2">Sección en Desarrollo</h3>
      <p class="text-slate-400">Aquí cargaremos la tabla de datos y los formularios conectados a FastAPI.</p>
    </div>
  `
})
export class AdminContentComponent {}