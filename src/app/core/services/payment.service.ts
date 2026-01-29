import { Injectable } from "@angular/core";
import { API } from "../constants/api.constants";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class PaymentService {

  private api = API.BASE_URL + API.PAYMENTS;

  constructor(private http: HttpClient) {}

  checkout(tourId: number) {
    return this.http.post<{ url: string }>(
      `${this.api}/checkout`,
      { tourId }
    );
  }
}
