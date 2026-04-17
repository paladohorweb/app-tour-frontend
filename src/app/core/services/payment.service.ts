import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../constants/api.constants';
import { Observable } from 'rxjs';
import { MetodoPago } from './reserva.service';

export interface CreateIntentResponse {
  clientSecret: string | null;
  reservaId: number;
  provider: string;
  checkoutUrl: string | null;
  reference: string | null;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly URL = `${API.BASE_URL}${API.PAYMENTS}`;

  constructor(private http: HttpClient) {}

  crearIntentoPago(reservaId: number, metodoPago: MetodoPago): Observable<CreateIntentResponse> {
    return this.http.post<CreateIntentResponse>(`${this.URL}/crear-intent`, {
      reservaId,
      metodoPago
    });
  }
}
