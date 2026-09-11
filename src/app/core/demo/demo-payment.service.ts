import { Injectable } from '@angular/core';

import {
  DemoApiError,
  DemoPaymentIntentResponse,
  DemoPaymentMethod
} from './demo.models';

import { DemoReservationService } from './demo-reservation.service';

const PAYMENT_METHODS: DemoPaymentMethod[] = [
  'TARJETA',
  'PSE',
  'NEQUI',
  'DAVIPLATA',
  'TRANSFERENCIA',
  'EFECTIVO'
];

@Injectable({
  providedIn: 'root'
})
export class DemoPaymentService {
  constructor(
    private readonly reservations: DemoReservationService
  ) {}

  createIntent(
    reservaId: number,
    metodoPagoValue: string
  ): DemoPaymentIntentResponse {
    const metodoPago = this.validatePaymentMethod(
      metodoPagoValue
    );

    const reservation =
      this.reservations.getPendingReservationForPayment(
        reservaId
      );

    const reference = this.createReference(
      reservation.id
    );

    this.reservations.confirmDemoPayment(
      reservation.id,
      metodoPago,
      reference
    );

    return {
      clientSecret: `demo_paid_${reference}`,
      reservaId: reservation.id,
      provider: 'DEMO',
      checkoutUrl: null,
      reference
    };
  }

  private validatePaymentMethod(
    value: string
  ): DemoPaymentMethod {
    if (
      !PAYMENT_METHODS.includes(
        value as DemoPaymentMethod
      )
    ) {
      throw new DemoApiError(
        400,
        'El método de pago seleccionado no es válido.'
      );
    }

    return value as DemoPaymentMethod;
  }

  private createReference(reservaId: number): string {
    return `DEMO-${reservaId}-${Date.now()}`;
  }
}
