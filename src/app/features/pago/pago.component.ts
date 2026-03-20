import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../core/services/payment.service';
import { ReservaService, ReservaResponse, MetodoPago } from '../../core/services/reserva.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-pago',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {

  loading = true;
  paying = false;
  error = '';

  reserva?: ReservaResponse;

  metodoPago: MetodoPago = 'TARJETA';
  metodos: MetodoPago[] = ['TARJETA', 'PSE', 'EFECTIVO', 'TRANSFERENCIA', 'NEQUI', 'DAVIPLATA'];

  private stripe: any;
  private elements: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit() {
    try {
      const reservaId = Number(this.route.snapshot.paramMap.get('reservaId'));
      if (!reservaId) throw new Error('reservaId inválido');

      this.reserva = await firstValueFrom(this.reservaService.obtenerReserva(reservaId));
      this.loading = false;

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || e?.message || 'No se pudo cargar la reserva';
      this.loading = false;
    }
  }

  async pagar() {
    if (!this.reserva) return;

    this.error = '';
    this.paying = true;

    try {
      const intentRes: any = await firstValueFrom(
        this.paymentService.crearIntentoPago(this.reserva.id, this.metodoPago)
      );

      // Si es método manual/prueba, backend ya la marca pagada
      if (this.metodoPago !== 'TARJETA') {
        this.router.navigate(['/order/success'], {
          queryParams: { reservaId: this.reserva.id }
        });
        return;
      }

      const stripe = await this.paymentService.getStripe();
      if (!stripe) throw new Error('Stripe no inicializó');

      this.stripe = stripe;
      this.elements = stripe.elements({ clientSecret: intentRes.clientSecret });

      // limpia render previo si vuelves a intentar
      const el = document.getElementById('payment-element');
      if (el) el.innerHTML = '';

      const paymentElement = this.elements.create('payment');
      paymentElement.mount('#payment-element');

      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success?reservaId=${this.reserva.id}`
        }
      });

      if (error) {
        this.error = error.message ?? 'Error en el pago';
        this.paying = false;
      }

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || 'No se pudo iniciar el pago';
      this.paying = false;
    }
  }
}
