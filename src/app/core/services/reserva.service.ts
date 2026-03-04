import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';

export type EstadoReserva = 'PENDIENTE' | 'PAGADA' | 'CANCELADA' | 'FALLIDA';

export interface ReservaResponse {
  id: number;
  tourId: number;
  tourNombre: string;

  // si tu backend lo devuelve (según tu ReservaResponseDTO sí lo tiene):
  usuarioId?: number;

  emailCliente?: string;
  nombreCliente?: string;

  monto: number;
  estado: EstadoReserva;

  stripePaymentIntentId?: string | null;
  fechaCreacion?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly URL = API.BASE_URL + API.RESERVAS;

  constructor(private http: HttpClient) {}

  crearReserva(tourId: number): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.URL, { tourId });
  }

  obtenerReserva(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${this.URL}/${id}`);
  }

  mias(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.URL}/mias`);
  }
}
