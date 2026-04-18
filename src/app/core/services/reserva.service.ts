import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../constants/api.constants';
import { Observable } from 'rxjs';

export type EstadoReserva =
  | 'PENDIENTE'
  | 'PAGADA'
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'CANCELADA'
  | 'FALLIDA';

export type MetodoPago =
  | 'TARJETA'
  | 'PSE'
  | 'NEQUI'
  | 'DAVIPLATA'
  | 'TRANSFERENCIA'
  | 'EFECTIVO';

export interface ReservaResponse {
  id: number;
  tourId: number;
  tourNombre: string;
  usuarioId?: number;
  emailCliente?: string;
  nombreCliente?: string;
  monto: number;
  estado: EstadoReserva;
  metodoPago?: MetodoPago | null;
  paymentProvider?: string | null;
  externalPaymentId?: string | null;
  paymentRedirectUrl?: string | null;
  paymentReference?: string | null;
  stripePaymentIntentId?: string | null;
  fechaCreacion?: string;
  guiaId?: number | null;
  guiaNombre?: string | null;
  guiaEmail?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly URL = `${API.BASE_URL}${API.RESERVAS}`;

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

  cancelar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.URL}/${id}/cancelar`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }
}
