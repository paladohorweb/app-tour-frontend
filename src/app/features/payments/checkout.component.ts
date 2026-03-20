import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../core/services/payment.service';
import { ReservaService } from '../../core/services/reserva.service';
import { TourService } from '../../core/services/tour.service';
import { Tour } from '../../core/models/tour.model';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  loading = true;
  paying = false;
  error = '';

  tour?: Tour;
  reservaId?: number;

  metodoPago: any = 'TARJETA';
  metodos = ['TARJETA', 'PSE', 'NEQUI', 'DAVIPLATA', 'EFECTIVO'];

  private stripe: any;
  private elements: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourService: TourService,
    private reservaService: ReservaService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit() {
    try {
      const tourId = Number(this.route.snapshot.paramMap.get('tourId'));
      if (!tourId) throw new Error('tourId inválido');

      // 1. tour
      this.tour = await firstValueFrom(this.tourService.obtenerPorId(tourId));

      // 2. reserva
      const reserva = await firstValueFrom(this.reservaService.crearReserva(tourId));
      this.reservaId = reserva.id;

      this.loading = false;

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || 'Error inicializando checkout';
      this.loading = false;
    }
  }

  async pagar() {

    if (!this.reservaId) return;

    this.paying = true;
    this.error = '';

    try {

      const intentRes: any = await firstValueFrom(
        this.paymentService.crearIntentoPago(this.reservaId, this.metodoPago)
      );

      // 🔥 pagos simulados (NO tarjeta)
      if (this.metodoPago !== 'TARJETA') {
        this.router.navigate(['/order/success'], {
          queryParams: { reservaId: this.reservaId }
        });
        return;
      }

      // Stripe
      const stripe = await this.paymentService.getStripe();
      if (!stripe) throw new Error('Stripe no inicializó');

      this.stripe = stripe;
      this.elements = stripe.elements({ clientSecret: intentRes.clientSecret });

      const container = document.getElementById('payment-element');
      if (container) container.innerHTML = '';

      const paymentElement = this.elements.create('payment');
      paymentElement.mount('#payment-element');

      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success?reservaId=${this.reservaId}`
        }
      });

      if (error) {
        this.error = error.message ?? 'Error en el pago';
        this.paying = false;
      }

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || 'Error procesando pago';
      this.paying = false;
    }
  }
}
