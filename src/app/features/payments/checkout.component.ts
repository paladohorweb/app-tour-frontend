import { Component, Input, OnInit } from '@angular/core';
import { PaymentService } from '../../core/services/payment.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {

  @Input() tourId!: number;

  loading = false;
  error = '';
  success = false;

  constructor(private paymentService: PaymentService) {}

  async ngOnInit() {
    this.loading = true;

    try {
      const res: any = await this.paymentService
        .crearIntentoPago(this.tourId)
        .toPromise();

      const stripe = await this.paymentService.getStripe();
      if (!stripe) return;

      const elements = stripe.elements({
        clientSecret: res.clientSecret
      });

      const paymentElement = elements.create('payment');
      paymentElement.mount('#payment-element');

      this.loading = false;

      const form = document.getElementById('payment-form')!;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/order/success'
          }
        });

        if (error) {
          this.error = error.message ?? 'Error en el pago';
        }
      });

    } catch (e) {
      this.error = 'No se pudo iniciar el pago';
      this.loading = false;
    }
  }
}
