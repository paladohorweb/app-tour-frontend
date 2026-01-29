import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Order } from "../models/order.model";

@Injectable({ providedIn: 'root' })
export class OrderService {
  [x: string]: any;

  private api = `${this["API"].AUHT}` + '/orders';

  constructor(private http: HttpClient) {}

  getMyOrders() {
    return this.http.get<Order[]>(`${this.api}/me`);
  }
}
