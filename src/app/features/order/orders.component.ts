import { Component, OnInit } from "@angular/core";
import { Order } from "../../core/models/order.model";
import { OrderService } from "../../core/services/order.service";
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule],
  template: `
    <h2>Mis reservas</h2>
    <div *ngFor="let o of orders">
      {{ o.total }} - {{ o.estado }}
    </div>
  `
})
export class OrdersComponent implements OnInit {

  orders: Order[] = [];

  constructor(private service: OrderService) {}

  ngOnInit() {
    this.service["myOrders"]().subscribe((res: Order[]) => this.orders = res);
  }
}

