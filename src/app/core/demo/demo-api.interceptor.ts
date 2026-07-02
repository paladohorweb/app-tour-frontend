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

import {
  DemoApiError,
  DemoDataService
} from './demo-data.service';

export const demoApiInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const demoData = inject(DemoDataService);

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

  const respond = <T>(payload: T) => {
    return of(
      new HttpResponse({
        status: 200,
        body: payload
      })
    ).pipe(delay(300));
  };

  const isDemoApiRequest = path.startsWith('/api/');

  if (!isDemoApiRequest) {
    return next(request);
  }

  try {
    /*
     * =================================================
     * AUTENTICACIÓN DEMO
     * =================================================
     */

    if (
      method === 'POST' &&
      path === '/api/auth/login'
    ) {
      return respond(
        demoData.login(
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
        demoData.register({
          nombre: String(body?.['nombre'] ?? ''),
          email: String(body?.['email'] ?? ''),
          password: String(body?.['password'] ?? ''),
          rol: String(body?.['rol'] ?? 'ROLE_USER')
        })
      );
    }

    /*
     * =================================================
     * RESPUESTAS TEMPORALES PARA LOS PANELES
     *
     * Estas respuestas permiten que las rutas carguen
     * mientras construimos tours, reservas y pagos.
     * =================================================
     */

    if (
      method === 'GET' &&
      path === '/api/admin/tours'
    ) {
      return respond([]);
    }

    if (
      method === 'GET' &&
      path === '/api/admin/reservas'
    ) {
      return respond([]);
    }

    if (
      method === 'GET' &&
      path === '/api/admin/guias'
    ) {
      return respond([]);
    }

    if (
      method === 'GET' &&
      path === '/api/guia/reservas'
    ) {
      return respond([]);
    }

    if (
      method === 'GET' &&
      path === '/api/reservas/mias'
    ) {
      return respond([]);
    }

    if (
      method === 'GET' &&
      path === '/api/tours'
    ) {
      return respond([]);
    }

    /*
     * No permitimos que ninguna solicitud /api llegue
     * accidentalmente a localhost:8086.
     */
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 501,
          statusText: 'Demo endpoint pending',
          url: request.url,
          error: {
            message:
              'Esta acción todavía no está implementada en la demo.'
          }
        })
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
