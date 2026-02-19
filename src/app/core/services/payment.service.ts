import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../constants/api.constants';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Observable } from 'rxjs';

export interface CreateIntentRequest {
  reservaId: number;
  //monto: number; // minor units (COP: 2000 = $2.000)
}

export interface CreateIntentResponse {
  clientSecret: string;
  reservaId: number;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  // ✅ Mejor: usa env o constants, pero por ahora fijo
  private stripePromise = loadStripe('pk_test_TU_PUBLIC_KEY');

  constructor(private http: HttpClient) {}


  crearIntentoPago(reservaId: number): Observable<CreateIntentResponse> {
    return this.http.post<CreateIntentResponse>(
      `${API.BASE_URL}${API.PAYMENTS}/crear-intent`,
      { reservaId } // ✅ backend espera reservaId
    );
  }

  async getStripe(): Promise<Stripe | null> {
    return await this.stripePromise;
  }
}

