import { Injectable } from "@angular/core";
import { API } from "../constants/api.constants";
import { HttpClient } from "@angular/common/http";
import { Order } from "../models/order.model";

@Injectable({ providedIn: 'root' })
export class AdminService {

  private api = API.BASE_URL + '/admin';

  constructor(private http: HttpClient) {}

  stats() {
    return this.http.get<any>(`${this.api}/stats`);
  }

  orders() {
    return this.http.get<Order[]>(`${this.api}/orders`);
  }
}
