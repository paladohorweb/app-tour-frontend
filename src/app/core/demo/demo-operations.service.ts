import { Injectable } from '@angular/core';

import {
  DemoApiError,
  DemoReservation,
  DemoReservationStatus,
  DemoUser
} from './demo.models';

import { DemoSessionService } from './demo-session.service';
import { DemoStoreService } from './demo-store.service';

export interface DemoGuideSummary {
  id: number;
  nombre: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class DemoOperationsService {
  constructor(
    private readonly store: DemoStoreService,
    private readonly session: DemoSessionService
  ) {}

  listAdminReservations(
    status?: string | null
  ): DemoReservation[] {
    this.session.requireRole('ROLE_ADMIN');

    const normalizedStatus = status?.trim().toUpperCase();

    const reservations = this.store.getReservations();

    const filteredReservations = normalizedStatus
      ? reservations.filter(
          (reservation) =>
            reservation.estado === normalizedStatus
        )
      : reservations;

    return filteredReservations.sort(
      (first, second) =>
        new Date(second.fechaCreacion).getTime() -
        new Date(first.fechaCreacion).getTime()
    );
  }

  listGuides(): DemoGuideSummary[] {
    this.session.requireRole('ROLE_ADMIN');

    return this.store
      .getUsers()
      .filter((user) => user.rol === 'ROLE_GUIA')
      .map((guide) => ({
        id: guide.id,
        nombre: guide.nombre,
        email: guide.email
      }));
  }

  assignGuide(
    reservationId: number,
    guideId: number
  ): DemoReservation {
    this.session.requireRole('ROLE_ADMIN');

    const reservation = this.findReservationOrFail(
      reservationId
    );

    if (reservation.estado !== 'PAGADA') {
      throw new DemoApiError(
        400,
        'Solo puedes asignar un guía a una reserva pagada.'
      );
    }

    const guide = this.findGuideOrFail(guideId);

    return this.store.updateReservation(
      reservation.id,
      {
        guiaId: guide.id,
        guiaNombre: guide.nombre,
        guiaEmail: guide.email
      }
    );
  }

  listGuideReservations(): DemoReservation[] {
    const guide = this.session.requireRole('ROLE_GUIA');

    return this.store
      .getReservations()
      .filter(
        (reservation) => reservation.guiaId === guide.id
      )
      .sort(
        (first, second) =>
          new Date(second.fechaCreacion).getTime() -
          new Date(first.fechaCreacion).getTime()
      );
  }

  startReservation(
    reservationId: number
  ): DemoReservation {
    const guide = this.session.requireRole('ROLE_GUIA');

    const reservation = this.findReservationOrFail(
      reservationId
    );

    this.ensureAssignedGuide(guide, reservation);

    if (reservation.estado !== 'PAGADA') {
      throw new DemoApiError(
        400,
        'Solo puedes iniciar una reserva pagada.'
      );
    }

    return this.store.updateReservation(
      reservation.id,
      {
        estado: 'EN_CURSO'
      }
    );
  }

  finishReservation(
    reservationId: number
  ): DemoReservation {
    const guide = this.session.requireRole('ROLE_GUIA');

    const reservation = this.findReservationOrFail(
      reservationId
    );

    this.ensureAssignedGuide(guide, reservation);

    if (reservation.estado !== 'EN_CURSO') {
      throw new DemoApiError(
        400,
        'Solo puedes finalizar una reserva que esté en curso.'
      );
    }

    return this.store.updateReservation(
      reservation.id,
      {
        estado: 'FINALIZADA'
      }
    );
  }

  private findReservationOrFail(
    reservationId: number
  ): DemoReservation {
    if (
      !Number.isInteger(reservationId) ||
      reservationId <= 0
    ) {
      throw new DemoApiError(
        400,
        'La reserva seleccionada no es válida.'
      );
    }

    const reservation =
      this.store.getReservationById(reservationId);

    if (!reservation) {
      throw new DemoApiError(
        404,
        'Reserva no encontrada.'
      );
    }

    return reservation;
  }

  private findGuideOrFail(
    guideId: number
  ): DemoUser {
    if (!Number.isInteger(guideId) || guideId <= 0) {
      throw new DemoApiError(
        400,
        'El guía seleccionado no es válido.'
      );
    }

    const guide = this.store
      .getUsers()
      .find((user) => user.id === guideId);

    if (!guide || guide.rol !== 'ROLE_GUIA') {
      throw new DemoApiError(
        404,
        'Guía no encontrado.'
      );
    }

    return guide;
  }

  private ensureAssignedGuide(
    guide: DemoUser,
    reservation: DemoReservation
  ): void {
    if (reservation.guiaId !== guide.id) {
      throw new DemoApiError(
        403,
        'Esta reserva no está asignada a tu cuenta.'
      );
    }
  }
}
