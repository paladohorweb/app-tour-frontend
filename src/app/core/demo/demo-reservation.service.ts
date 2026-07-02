import { Injectable } from '@angular/core';

import {
  DemoApiError,
  DemoPaymentMethod,
  DemoReservation,
  DemoReservationStatus,
  DemoUser
} from './demo.models';

import { DemoSessionService } from './demo-session.service';
import { DemoStoreService } from './demo-store.service';

@Injectable({
  providedIn: 'root'
})
export class DemoReservationService {
  constructor(
    private readonly store: DemoStoreService,
    private readonly session: DemoSessionService
  ) {}

  create(tourId: number): DemoReservation {
    if (!Number.isInteger(tourId) || tourId <= 0) {
      throw new DemoApiError(
        400,
        'El tour seleccionado no es válido.'
      );
    }

    const user = this.session.requireAuthenticated();
    const tour = this.store.getTourById(tourId);

    if (!tour || !tour.activo) {
      throw new DemoApiError(
        404,
        'El tour no está disponible para reserva.'
      );
    }

    const monto = Number(tour.precio ?? 0);

    if (!Number.isFinite(monto) || monto <= 0) {
      throw new DemoApiError(
        400,
        'El tour no tiene un precio válido.'
      );
    }

    return this.store.createReservation({
      tourId: tour.id,
      tourNombre: tour.nombre,

      usuarioId: user.id,
      emailCliente: user.email,
      nombreCliente: user.nombre,

      monto,
      estado: 'PENDIENTE',

      metodoPago: null,
      paymentProvider: null,
      externalPaymentId: null,
      paymentRedirectUrl: null,
      paymentReference: null,
      stripePaymentIntentId: null,

      fechaCreacion: new Date().toISOString(),

      guiaId: null,
      guiaNombre: null,
      guiaEmail: null
    });
  }

  getById(id: number): DemoReservation {
    const user = this.session.requireAuthenticated();
    const reservation = this.findReservationOrFail(id);

    this.ensureCanView(user, reservation);

    return reservation;
  }

  listMine(): DemoReservation[] {
    const user = this.session.requireAuthenticated();

    return this.store
      .getReservations()
      .filter(
        (reservation) =>
          reservation.usuarioId === user.id
      )
      .sort(
        (first, second) =>
          new Date(second.fechaCreacion).getTime() -
          new Date(first.fechaCreacion).getTime()
      );
  }

  cancel(id: number): void {
    const reservation = this.getOwnedReservation(id);

    if (reservation.estado !== 'PENDIENTE') {
      throw new DemoApiError(
        400,
        'Solo puedes cancelar reservas pendientes de pago.'
      );
    }

    this.store.updateReservation(id, {
      estado: 'CANCELADA'
    });
  }

  delete(id: number): void {
    const reservation = this.getOwnedReservation(id);

    const removableStates: DemoReservationStatus[] = [
      'PENDIENTE',
      'CANCELADA',
      'FALLIDA'
    ];

    if (!removableStates.includes(reservation.estado)) {
      throw new DemoApiError(
        400,
        'Esta reserva no puede eliminarse en su estado actual.'
      );
    }

    this.store.deleteReservation(id);
  }

  getPendingReservationForPayment(
    id: number
  ): DemoReservation {
    const reservation = this.getOwnedReservation(id);

    if (reservation.estado !== 'PENDIENTE') {
      throw new DemoApiError(
        400,
        'La reserva ya no está pendiente de pago.'
      );
    }

    return reservation;
  }

  confirmDemoPayment(
    id: number,
    metodoPago: DemoPaymentMethod,
    reference: string
  ): DemoReservation {
    this.getPendingReservationForPayment(id);

    return this.store.updateReservation(id, {
      estado: 'PAGADA',
      metodoPago,

      paymentProvider: 'DEMO',
      externalPaymentId: reference,
      paymentReference: reference,
      paymentRedirectUrl: null,
      stripePaymentIntentId: null
    });
  }

  private getOwnedReservation(
    id: number
  ): DemoReservation {
    const user = this.session.requireAuthenticated();
    const reservation = this.findReservationOrFail(id);

    if (reservation.usuarioId !== user.id) {
      throw new DemoApiError(
        403,
        'No tienes permisos sobre esta reserva.'
      );
    }

    return reservation;
  }

  private findReservationOrFail(
    id: number
  ): DemoReservation {
    if (!Number.isInteger(id) || id <= 0) {
      throw new DemoApiError(
        400,
        'La reserva seleccionada no es válida.'
      );
    }

    const reservation = this.store.getReservationById(id);

    if (!reservation) {
      throw new DemoApiError(
        404,
        'Reserva no encontrada.'
      );
    }

    return reservation;
  }

  private ensureCanView(
    user: DemoUser,
    reservation: DemoReservation
  ): void {
    const isOwner = reservation.usuarioId === user.id;
    const isAdmin = user.rol === 'ROLE_ADMIN';

    if (!isOwner && !isAdmin) {
      throw new DemoApiError(
        403,
        'No tienes permisos para consultar esta reserva.'
      );
    }
  }
}
