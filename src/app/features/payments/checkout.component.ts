import { Component } from "@angular/core";
import { StripeService } from "../../core/services/stripe.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  standalone: true,
  template: `<button (click)="pagar()">Pagar</button>`
})
export class CheckoutComponent {

  constructor(
    private stripe: StripeService,
    private route: ActivatedRoute
  ) {}

  pagar() {
    const tourId = Number(this.route.snapshot.paramMap.get('id'));

    this.stripe.checkout({ tourId, cantidad: 1 })
      .subscribe(res => window.location.href = res.sessionUrl);
  }
}
