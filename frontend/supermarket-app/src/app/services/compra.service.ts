import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Compra } from '../models/compra.model';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private http = inject(HttpClient);
  private apiUrl = 'http://172.20.10.4:8000/api/compras';

  getCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.apiUrl}/`);
  }

  crearCompra(compra: Compra): Observable<Compra> {
    return this.http.post<Compra>(`${this.apiUrl}/`, compra);
  }
}