import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API } from "../constants/api.constants";

@Injectable({ providedIn: 'root' })
export class PagoService {
  constructor(private http: HttpClient) {}

  crearIntent(data: any) {
    return this.http.post(
      `${API.BASE_URL}${API.PAYMENTS}/crear-intent`,
      data
    );
  }
}
