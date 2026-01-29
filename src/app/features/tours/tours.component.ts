import { Component, OnInit } from "@angular/core";
import { Tour } from "../../core/models/tour";
import { PaymentService } from "../../core/services/payment.service";
import { TourService } from "../../core/services/tour.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-tours',
  imports: [FormsModule,CommonModule],
  template: `
    <div *ngFor="let tour of tours">
      <h3>{{ tour.nombre }}</h3>
      <p>{{ tour.descripcion }}</p>
      <button (click)="buy(tour.id)">Reservar</button>
    </div>
  `
})
export class ToursComponent implements OnInit {

  tours: Tour[] = [];

  constructor(
    private tourService: TourService,
    private payment: PaymentService
  ) {}

  ngOnInit() {
    this.tourService.getAll().subscribe(res => this.tours = res);
  }

  buy(id: number) {
    this.payment.checkout(id)
      .subscribe(res => window.location.href = res.url);
  }
}
