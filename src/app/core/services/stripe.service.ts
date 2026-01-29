import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CheckoutRequest, CheckoutResponse } from "../models/payment.model";
import { API } from "../constants/api.constants";

@Injectable({ providedIn: 'root' })
export class StripeService {

  constructor(private http: HttpClient) {}

  checkout(data: CheckoutRequest) {
    return this.http.post<CheckoutResponse>(
      `${API.PAYMENTS}/checkout`,
      data
    );
  }
}
