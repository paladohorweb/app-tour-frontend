import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../constants/api.constants';
import { Observable } from 'rxjs';
import { ReservaResponse } from './reserva.service';

export interface GuiaSimple {
  id: number;
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly URL = `${API.BASE_URL}${API.ADMIN}`;

  constructor(private http: HttpClient) {}

  listarReservas(estado?: string): Observable<ReservaResponse[]> {
    const qs = estado ? `?estado=${estado}` : '';
    return this.http.get<ReservaResponse[]>(`${this.URL}/reservas${qs}`);
  }

  listarGuias(): Observable<GuiaSimple[]> {
    return this.http.get<GuiaSimple[]>(`${this.URL}/guias`);
  }

  asignarGuia(reservaId: number, guiaId: number): Observable<void> {
    return this.http.patch<void>(`${this.URL}/reservas/${reservaId}/asignar-guia/${guiaId}`, {});
  }
}
