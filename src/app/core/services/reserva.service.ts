import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../constants/api.constants';
import { Observable } from 'rxjs';

export interface ReservaResponse {
  id: number;
  tourId: number;
  tourNombre: string;
  monto: number; // backend manda BigDecimal; en TS lo tratamos como number
  estado: 'PENDIENTE' | 'PAGADA' | 'CANCELADA' | 'FALLIDA';
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  constructor(private http: HttpClient) {}

  crearReserva(tourId: number): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(
      `${API.BASE_URL}${API.RESERVAS}`,
      { tourId }
    );
  }

  obtenerReserva(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${API.BASE_URL}${API.RESERVAS}/${id}`);
  }
}
