import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { PagoRequest, PagoResponse } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {

  private base = API.BASE_URL + API.PAYMENTS;

  constructor(private http: HttpClient) {}

  crearIntentoPago(data: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(
      `${this.base}/crear-intent`,
      data
    );
  }
}

