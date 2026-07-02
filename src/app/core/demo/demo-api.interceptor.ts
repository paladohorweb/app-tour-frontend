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

import { DemoSessionService } from './demo-session.service';
import { DemoStoreService } from './demo-store.service';

export const demoApiInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const store = inject(DemoStoreService);
  const session = inject(DemoSessionService);

  const method = request.method.toUpperCase();

  const requestUrl = new URL(
    request.url,
    window.location.origin
  );

  const path = requestUrl.pathname.replace(/\/+$/, '');
  const body = request.body as Record<string, unknown> | null;

  if (!path.startsWith('/api/')) {
    return next(request);
  }

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
     * ==========================
     * AUTENTICACIÓN
     * ==========================
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
     * ==========================
     * TOURS PÚBLICOS
     * ==========================
     */

    if (
      method === 'GET' &&
      path === '/api/tours'
    ) {
      return respond(store.getActiveTours());
    }

    if (
      method === 'GET' &&
      /^\/api\/tours\/\d+$/.test(path)
    ) {
      const tour = store.getTourById(getLastId(path));

      if (!tour) {
        throw new DemoApiError(
          404,
          'Tour no encontrado.'
        );
      }

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
     * ==========================
     * TOURS ADMINISTRACIÓN
     * ==========================
     */

    if (
      method === 'GET' &&
      path === '/api/admin/tours'
    ) {
      session.requireRole('ROLE_ADMIN');

      return respond(store.getTours());
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

      store.deleteTour(getLastId(path));

      return respond(null);
    }

    /*
     * Estas rutas se mantienen vacías temporalmente
     * para que dashboard, guía y reservas no intenten
     * comunicarse con Spring Boot mientras construimos
     * el siguiente bloque.
     */

    if (
      method === 'GET' &&
      path === '/api/admin/reservas'
    ) {
      session.requireRole('ROLE_ADMIN');

      return respond([]);
    }

    if (
      method === 'GET' &&
      path === '/api/admin/guias'
    ) {
      session.requireRole('ROLE_ADMIN');

      return respond([]);
    }

    if (
      method === 'GET' &&
      path === '/api/guia/reservas'
    ) {
      session.requireRole('ROLE_GUIA');

      return respond([]);
    }

    if (
      method === 'GET' &&
      path === '/api/reservas/mias'
    ) {
      session.getCurrentUser();

      return respond([]);
    }

    throw new DemoApiError(
      501,
      'Esta ruta todavía no está implementada en la demo.'
    );
  } catch (error) {
    const demoError =
      error instanceof DemoApiError
        ? error
        : new DemoApiError(
            500,
            'Ocurrió un error interno en la demo.'
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
