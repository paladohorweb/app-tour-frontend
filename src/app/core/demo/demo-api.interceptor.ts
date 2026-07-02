import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  delay,
  of,
  throwError
} from 'rxjs';

import { TourCreate } from '../models/tour-create.model';

import {
  DemoApiError,
  DemoRegisterRequest
} from './demo.models';

import { DemoOperationsService } from './demo-operations.service';
import { DemoPaymentService } from './demo-payment.service';
import { DemoReservationService } from './demo-reservation.service';
import { DemoSessionService } from './demo-session.service';
import { DemoStoreService } from './demo-store.service';

export const demoApiInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const store = inject(DemoStoreService);
  const session = inject(DemoSessionService);
  const reservations = inject(DemoReservationService);
  const payments = inject(DemoPaymentService);
  const operations = inject(DemoOperationsService);

  const method = request.method.toUpperCase();

  const requestUrl = new URL(
    request.url,
    window.location.origin
  );

  const path = requestUrl.pathname.replace(
    /\/+$/,
    ''
  );

  const body = request.body as Record<string, unknown> | null;

  /*
   * Solo interceptamos rutas de la API.
   *
   * Recursos externos, imágenes, Leaflet, Bootstrap
   * y demás solicitudes siguen su flujo normal.
   */
  if (!path.startsWith('/api/')) {
    return next(request);
  }

  /*
   * Simula una respuesta HTTP del backend.
   * El delay es útil para que loaders y estados
   * de carga se comporten como en producción.
   */
  const respond = <T>(payload: T) => {
    return of(
      new HttpResponse({
        status: 200,
        body: payload
      })
    ).pipe(delay(300));
  };

  try {
    /*
     * =================================================
     * AUTENTICACIÓN
     * =================================================
     */

    if (
      method === 'POST' &&
      path === '/api/auth/login'
    ) {
      return respond(
        session.login(
          String(body?.['email'] ?? ''),
          String(body?.['password'] ?? '')
        )
      );
    }

    if (
      method === 'POST' &&
      path === '/api/auth/register'
    ) {
      return respond(
        session.register({
          nombre: String(body?.['nombre'] ?? ''),
          email: String(body?.['email'] ?? ''),
          password: String(body?.['password'] ?? ''),
          rol: String(
            body?.['rol'] ?? 'ROLE_USER'
          ) as DemoRegisterRequest['rol']
        })
      );
    }

    /*
     * =================================================
     * TOURS PÚBLICOS
     * =================================================
     */

    if (
      method === 'GET' &&
      path === '/api/tours'
    ) {
      return respond(
        store.getActiveTours()
      );
    }

    if (
      method === 'GET' &&
      /^\/api\/tours\/\d+$/.test(path)
    ) {
      const tour = store.getTourById(
        getLastId(path)
      );

      if (!tour) {
        throw new DemoApiError(
          404,
          'Tour no encontrado.'
        );
      }

      /*
       * Un administrador puede consultar tours inactivos
       * desde administración. Un visitante normal no.
       */
      const canViewInactive =
        session.isCurrentUserAdmin();

      if (!tour.activo && !canViewInactive) {
        throw new DemoApiError(
          404,
          'Tour no disponible.'
        );
      }

      return respond(tour);
    }

    /*
     * =================================================
     * ADMINISTRACIÓN DE TOURS
     * =================================================
     */

    if (
      method === 'GET' &&
      path === '/api/admin/tours'
    ) {
      session.requireRole('ROLE_ADMIN');

      return respond(
        store.getTours()
      );
    }

    if (
      method === 'POST' &&
      path === '/api/tours'
    ) {
      session.requireRole('ROLE_ADMIN');

      return respond(
        store.createTour(
          body as unknown as TourCreate
        )
      );
    }

    if (
      method === 'PUT' &&
      /^\/api\/tours\/\d+$/.test(path)
    ) {
      session.requireRole('ROLE_ADMIN');

      return respond(
        store.updateTour(
          getLastId(path),
          body as unknown as TourCreate
        )
      );
    }

    if (
      method === 'PATCH' &&
      /^\/api\/tours\/\d+\/activo$/.test(path)
    ) {
      session.requireRole('ROLE_ADMIN');

      store.changeTourStatus(
        getLastId(path),
        Boolean(body?.['activo'])
      );

      return respond(null);
    }

    if (
      method === 'DELETE' &&
      /^\/api\/tours\/\d+$/.test(path)
    ) {
      session.requireRole('ROLE_ADMIN');

      store.deleteTour(
        getLastId(path)
      );

      return respond(null);
    }

    /*
     * =================================================
     * RESERVAS DEL VIAJERO
     * =================================================
     */

    if (
      method === 'POST' &&
      path === '/api/reservas'
    ) {
      return respond(
        reservations.create(
          Number(body?.['tourId'])
        )
      );
    }

    if (
      method === 'GET' &&
      path === '/api/reservas/mias'
    ) {
      return respond(
        reservations.listMine()
      );
    }

    if (
      method === 'GET' &&
      /^\/api\/reservas\/\d+$/.test(path)
    ) {
      return respond(
        reservations.getById(
          getLastId(path)
        )
      );
    }

    if (
      method === 'PATCH' &&
      /^\/api\/reservas\/\d+\/cancelar$/.test(path)
    ) {
      reservations.cancel(
        getLastId(path)
      );

      return respond(null);
    }

    if (
      method === 'DELETE' &&
      /^\/api\/reservas\/\d+$/.test(path)
    ) {
      reservations.delete(
        getLastId(path)
      );

      return respond(null);
    }

    /*
     * =================================================
     * PAGOS DEMO
     * =================================================
     *
     * El pago se aprueba en el navegador y deja la
     * reserva en estado PAGADA.
     */

    if (
      method === 'POST' &&
      path === '/api/pagos/crear-intent'
    ) {
      return respond(
        payments.createIntent(
          Number(body?.['reservaId']),
          String(body?.['metodoPago'] ?? '')
        )
      );
    }

    /*
     * =================================================
     * ADMINISTRACIÓN DE RESERVAS
     * =================================================
     */

    if (
      method === 'GET' &&
      path === '/api/admin/reservas'
    ) {
      const estado = requestUrl.searchParams.get(
        'estado'
      );

      return respond(
        operations.listAdminReservations(estado)
      );
    }

    if (
      method === 'GET' &&
      path === '/api/admin/guias'
    ) {
      return respond(
        operations.listGuides()
      );
    }

    if (
      method === 'PATCH' &&
      /^\/api\/admin\/reservas\/\d+\/asignar-guia\/\d+$/.test(
        path
      )
    ) {
      const {
        reservationId,
        guideId
      } = getAssignmentIds(path);

      return respond(
        operations.assignGuide(
          reservationId,
          guideId
        )
      );
    }

    /*
     * =================================================
     * OPERACIÓN DEL GUÍA
     * =================================================
     */

    if (
      method === 'GET' &&
      path === '/api/guia/reservas'
    ) {
      return respond(
        operations.listGuideReservations()
      );
    }

    if (
      method === 'PATCH' &&
      /^\/api\/guia\/reservas\/\d+\/iniciar$/.test(path)
    ) {
      return respond(
        operations.startReservation(
          getLastId(path)
        )
      );
    }

    if (
      method === 'PATCH' &&
      /^\/api\/guia\/reservas\/\d+\/finalizar$/.test(path)
    ) {
      return respond(
        operations.finishReservation(
          getLastId(path)
        )
      );
    }

    /*
     * Ninguna ruta /api debe intentar comunicarse
     * accidentalmente con localhost:8086.
     */
    throw new DemoApiError(
      501,
      `La ruta demo ${method} ${path} todavía no está implementada.`
    );
  } catch (error) {
    const demoError =
      error instanceof DemoApiError
        ? error
        : new DemoApiError(
            500,
            'Ocurrió un error interno en el modo demo.'
          );

    return throwError(
      () =>
        new HttpErrorResponse({
          status: demoError.status,
          statusText: 'Demo API error',
          url: request.url,
          error: {
            message: demoError.message
          }
        })
    );
  }
};

function getLastId(path: string): number {
  const matches = Array.from(
    path.matchAll(/\/(\d+)/g)
  );

  const lastMatch = matches[matches.length - 1];

  return lastMatch
    ? Number(lastMatch[1])
    : 0;
}

function getAssignmentIds(path: string): {
  reservationId: number;
  guideId: number;
} {
  const match = path.match(
    /^\/api\/admin\/reservas\/(\d+)\/asignar-guia\/(\d+)$/
  );

  if (!match) {
    return {
      reservationId: 0,
      guideId: 0
    };
  }

  return {
    reservationId: Number(match[1]),
    guideId: Number(match[2])
  };
}
