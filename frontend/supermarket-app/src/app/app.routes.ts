import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { AdminHomeComponent } from './features/admin/pages/admin-home.component';
import { UsuarioListaComponent } from './features/admin/pages/usuario-lista.component';
import { ProductoListaComponent } from './features/admin/pages/producto-lista.component';
import { ReporteDashboardComponent } from './features/admin/pages/reporte-dashboard.component';
import { BodegaDashboardComponent } from './features/bodega/bodega-dashboard.component';
import { CajeroDashboardComponent } from './features/cajero/cajero-dashboard.component';
import { CategoriaListaComponent } from './features/admin/pages/categoria-lista.component';
import { ProveedorListaComponent } from './features/admin/pages/proveedor-lista.component';
import { ClienteListaComponent } from './features/admin/pages/cliente-lista.component';
import { VentaPosComponent } from './features/admin/pages/venta-pos.component';
import { CompraPosComponent } from './features/admin/pages/compra-pos.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', component: AdminHomeComponent },
      { path: 'usuarios', component: UsuarioListaComponent },
      { path: 'productos', component: ProductoListaComponent },
      { path: 'clientes', component: ClienteListaComponent },
      { path: 'reportes', component: ReporteDashboardComponent },
      { path: 'categorias', component: CategoriaListaComponent },
      { path: 'proveedores', component: ProveedorListaComponent },
      { path: 'ventas', component: VentaPosComponent },
      { path: 'compras', component: CompraPosComponent }
    ]
  },
  { 
    path: 'bodega', 
    component: BodegaDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'BODEGA'] }
  },
  { 
    path: 'cajero', 
    component: CajeroDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CAJERO'] }
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];