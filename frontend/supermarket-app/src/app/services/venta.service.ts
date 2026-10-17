import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaCreate, VentaResponse } from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://172.20.10.4:8000/api/ventas';

  getVentas(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.apiUrl);
  }

  crearVenta(venta: VentaCreate): Observable<any> {
    return this.http.post<any>(this.apiUrl, venta);
  }
}