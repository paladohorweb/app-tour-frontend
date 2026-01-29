import { Component, OnInit } from "@angular/core";
import { Order } from "../../../core/models/order.model";

@Component({
  standalone: true,
  template: `
    <h2>Órdenes</h2>

    <div *ngFor="let o of orders">
      {{ o.id }} - {{ o.total }} - {{ o.estado }}
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {

  orders: Order[] = [];

  constructor(private service: AdminService) {}

  ngOnInit() {
    this.service.orders().subscribe(r => this.orders = r);
  }
}
