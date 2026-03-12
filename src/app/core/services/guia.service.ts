import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../constants/api.constants';
import { Observable } from 'rxjs';
import { ReservaResponse } from './reserva.service';

@Injectable({ providedIn: 'root' })
export class GuiaService {
  private readonly URL = `${API.BASE_URL}${API.GUIA}`;

  constructor(private http: HttpClient) {}

  misReservas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.URL}/reservas`);
  }

  iniciar(reservaId: number): Observable<void> {
    return this.http.patch<void>(`${this.URL}/reservas/${reservaId}/iniciar`, {});
  }

  finalizar(reservaId: number): Observable<void> {
    return this.http.patch<void>(`${this.URL}/reservas/${reservaId}/finalizar`, {});
  }
}
