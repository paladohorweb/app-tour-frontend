import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../constants/api.constants';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  private stripePromise = loadStripe('pk_test_TU_PUBLIC_KEY');

  constructor(private http: HttpClient) {}

  crearIntentoPago(tourId: number) {
    return this.http.post<any>(
      `${API.BASE_URL}${API.PAYMENTS}/crear-intent`,
      { tourId }
    );
  }

  async getStripe(): Promise<Stripe | null> {
    return await this.stripePromise;
  }
}
