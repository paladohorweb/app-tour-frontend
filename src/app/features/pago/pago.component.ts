
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../core/services/payment.service';
import { ReservaService, ReservaResponse } from '../../core/services/reserva.service';

@Component({
  standalone: true,
  selector: 'app-pago',
  imports: [CommonModule, RouterLink],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {

  loading = true;
  paying = false;
  error = '';

  reserva?: ReservaResponse;

  private stripe: any;
  private elements: any;

  constructor(
    private route: ActivatedRoute,
    private reservaService: ReservaService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit() {
    try {
      const reservaId = Number(this.route.snapshot.paramMap.get('reservaId'));
      if (!reservaId) throw new Error('reservaId inválido');

      this.reserva = await firstValueFrom(this.reservaService.obtenerReserva(reservaId));

      const intentRes: any = await firstValueFrom(this.paymentService.crearIntentoPago(reservaId));

      const stripe = await this.paymentService.getStripe();
      if (!stripe) throw new Error('Stripe no inicializó');

      this.stripe = stripe;
      this.elements = stripe.elements({ clientSecret: intentRes.clientSecret });

      const paymentElement = this.elements.create('payment');
      paymentElement.mount('#payment-element');

      this.loading = false;

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || e?.message || 'No se pudo iniciar el pago';
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
          return_url: `${window.location.origin}/order/success?reservaId=${this.reserva?.id}`
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
