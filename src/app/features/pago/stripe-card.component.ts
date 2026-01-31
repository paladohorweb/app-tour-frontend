import {
  Component,
  AfterViewInit,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { PagoService } from '../../core/services/pago.service';

@Component({
  standalone: true,
  selector: 'app-stripe-card',
  imports: [CommonModule],
  template: `
    <div id="card-element" class="card-box"></div>
    <button (click)="confirmarPago()">Confirmar pago</button>
  `,
  styles: [`
    .card-box {
      border: 1px solid #ccc;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 6px;
    }
  `]
})
export class StripeCardComponent implements AfterViewInit {

  @Input() reservaId!: number;

  stripe!: Stripe;
  elements!: StripeElements;
  card: any;

  constructor(private pagoService: PagoService) {}

  async ngAfterViewInit() {
    this.stripe = await loadStripe('pk_test_TU_PUBLIC_KEY') as Stripe;

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card');
    this.card.mount('#card-element');
  }

  confirmarPago() {
    this.pagoService.crearIntentoPago({ reservaId: this.reservaId })
      .subscribe(async res => {

        const result = await this.stripe.confirmCardPayment(
          res.clientSecret,
          {
            payment_method: {
              card: this.card
            }
          }
        );

        if (result.error) {
          alert(result.error.message);
        } else if (result.paymentIntent?.status === 'succeeded') {
          alert('Pago exitoso ✅');
        }
      });
  }
}
