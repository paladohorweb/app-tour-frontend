import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeCardComponent } from './stripe-card.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-pago',
  imports: [CommonModule, StripeCardComponent],
  template: `
    <h2>Pago de la reserva</h2>
    <app-stripe-card [reservaId]="reservaId"></app-stripe-card>
  `
})
export class PagoComponent {

  reservaId!: number;

  constructor(private route: ActivatedRoute) {
    this.reservaId = Number(this.route.snapshot.paramMap.get('reservaId'));
  }
}
