import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../core/services/payment.service';
import { ReservaService } from '../../core/services/reserva.service';
import { TourService } from '../../core/services/tour.service';
import { Tour } from '../../core/models/tour.model';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  loading = true;
  paying = false;
  error = '';

  tour?: Tour;
  reservaId?: number;

  private stripe: any;
  private elements: any;

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private reservaService: ReservaService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit() {
    try {
      const tourId = Number(this.route.snapshot.paramMap.get('tourId'));
      if (!tourId) throw new Error('tourId inválido');

      // 1) cargar tour
      this.tour = await firstValueFrom(this.tourService.obtenerPorId(tourId));

      // 2) crear reserva
      const reserva = await firstValueFrom(this.reservaService.crearReserva(tourId));
      this.reservaId = reserva.id;

      // 3) crear intent de pago (solo reservaId)
      const intentRes = await firstValueFrom(this.paymentService.crearIntentoPago(reserva.id));

      // 4) stripe elements
      const stripe = await this.paymentService.getStripe();
      if (!stripe) throw new Error('Stripe no inicializó');

      this.stripe = stripe;
      this.elements = stripe.elements({ clientSecret: intentRes.clientSecret });

      const paymentElement = this.elements.create('payment');
      paymentElement.mount('#payment-element');

      this.loading = false;

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || 'No se pudo iniciar el pago';
      this.loading = false;
    }
  }

   async pagar() {
    if (!this.stripe || !this.elements) return;

    this.error = '';
    this.paying = true;

    try {
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          // ✅ pasamos la reservaId para que success la consulte
          return_url: `${window.location.origin}/order/success?reservaId=${this.reservaId}`
        }
      });

      if (error) {
        this.error = error.message ?? 'Error en el pago';
        this.paying = false;
      }
    } catch (e) {
      console.error(e);
      this.error = 'No se pudo confirmar el pago';
      this.paying = false;
    }
  }
}
