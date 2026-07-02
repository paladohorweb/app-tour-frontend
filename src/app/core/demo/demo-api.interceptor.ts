import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  Observable,
  of,
  throwError
} from 'rxjs';

import { API } from '../constants/api.constants';
import { DEMO_MODE } from '../constants/demo.constants';
import { EstadoReserva } from '../services/reserva.service';
import { DemoDataService } from './demo-data.service';

export const demoApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!DEMO_MODE) {
    return next(request);
  }

  const demoData = inject(DemoDataService);

  const method = request.method.toUpperCase();
  const requestUrl = new URL(
    request.url,
    window.location.origin
  );

  const url = requestUrl.pathname.replace(/\/+$/, '');
  const params = requestUrl.searchParams;
  const body = request.body as Record<string, unknown> | null;

  const respond = <T>(
    payload: T,
    status = 200
  ): Observable<HttpResponse<T>> => {
    return of(
      new HttpResponse({
        status,
        body: payload
      })
    );
  };

  /*
   * ==========================
   * AUTENTICACIÓN
   * ==========================
   */

  if (method === 'POST' && url.endsWith('/auth/login')) {
    return respond(
      demoData.login(
        String(body?.['email'] ?? ''),
        String(body?.['password'] ?? '')
      )
    );
  }

  if (method === 'POST' && url.endsWith('/auth/register')) {
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
   * ==========================
   * TOURS ADMINISTRACIÓN
   * ==========================
   */

  if (method === 'GET' && url.endsWith('/admin/tours')) {
    return respond(demoData.listTours(true));
  }

  /*
   * ==========================
   * TOURS PÚBLICOS
   * ==========================
   */

  if (method === 'GET' && url.endsWith('/tours')) {
    return respond(demoData.listTours(false));
  }

  if (method === 'POST' && url.endsWith('/tours')) {
    return respond(demoData.createTour(body ?? {}));
  }

  if (
    method === 'PATCH' &&
    /\/tours\/\d+\/activo$/.test(url)
  ) {
    demoData.toggleTour(
      getLastIdFromUrl(url),
      Boolean(body?.['activo'])
    );

    return respond(null);
  }

  if (
    method === 'GET' &&
    /\/tours\/\d+$/.test(url)
  ) {
    return respond(
      demoData.getTour(getLastIdFromUrl(url))
    );
  }

  if (
    method === 'PUT' &&
    /\/tours\/\d+$/.test(url)
  ) {
    return respond(
      demoData.updateTour(
        getLastIdFromUrl(url),
        body ?? {}
      )
    );
  }

  if (
    method === 'DELETE' &&
    /\/tours\/\d+$/.test(url)
  ) {
    demoData.deleteTour(getLastIdFromUrl(url));

    return respond(null);
  }

  /*
   * ==========================
   * RESERVAS DEL VIAJERO
   * ==========================
   */

  if (method === 'POST' && url.endsWith('/reservas')) {
    return respond(
      demoData.createReserva(
        Number(body?.['tourId'])
      )
    );
  }

  if (method === 'GET' && url.endsWith('/reservas/mias')) {
    return respond(demoData.misReservas());
  }

  if (
    method === 'PATCH' &&
    /\/reservas\/\d+\/cancelar$/.test(url)
  ) {
    demoData.cancelReserva(getLastIdFromUrl(url));

    return respond(null);
  }

  if (
    method === 'GET' &&
    /\/reservas\/\d+$/.test(url)
  ) {
    return respond(
      demoData.getReserva(getLastIdFromUrl(url))
    );
  }

  if (
    method === 'DELETE' &&
    /\/reservas\/\d+$/.test(url)
  ) {
    demoData.deleteReserva(getLastIdFromUrl(url));

    return respond(null);
  }

  /*
   * ==========================
   * PAGOS
   * ==========================
   */

  if (
    method === 'POST' &&
    url.endsWith('/pagos/crear-intent')
  ) {
    return respond(
      demoData.createPaymentIntent(
        Number(body?.['reservaId']),
        String(body?.['metodoPago'] ?? 'TARJETA')
      )
    );
  }

  /*
   * ==========================
   * ADMINISTRACIÓN DE RESERVAS
   * ==========================
   */

  if (
    method === 'GET' &&
    url.endsWith('/admin/reservas')
  ) {
    const estado = params.get('estado') as EstadoReserva | null;

    return respond(
      demoData.adminReservas(estado ?? undefined)
    );
  }

  if (
    method === 'GET' &&
    url.endsWith('/admin/guias')
  ) {
    return respond(demoData.listGuias());
  }

  if (
    method === 'PATCH' &&
    /\/admin\/reservas\/\d+\/asignar-guia\/\d+$/.test(url)
  ) {
    const ids = getIdsFromUrl(url);

    demoData.assignGuia(
      ids[0],
      ids[1]
    );

    return respond(null);
  }

  /*
   * ==========================
   * PANEL DEL GUÍA
   * ==========================
   */

  if (
    method === 'GET' &&
    url.endsWith('/guia/reservas')
  ) {
    return respond(demoData.guiaReservas());
  }

  if (
    method === 'PATCH' &&
    /\/guia\/reservas\/\d+\/iniciar$/.test(url)
  ) {
    demoData.iniciarReserva(getLastIdFromUrl(url));

    return respond(null);
  }

  if (
    method === 'PATCH' &&
    /\/guia\/reservas\/\d+\/finalizar$/.test(url)
  ) {
    demoData.finalizarReserva(getLastIdFromUrl(url));

    return respond(null);
  }

  /*
   * En la rama demo no permitimos que una URL de tu API
   * llegue accidentalmente al backend real.
   */
  if (request.url.startsWith(API.BASE_URL)) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 404,
          statusText: 'Demo API endpoint not implemented',
          url: request.url,
          error: {
            message:
              'Esta ruta no está implementada en el mock demo.'
          }
        })
    );
  }

  return next(request);
};

function getLastIdFromUrl(url: string): number {
  const ids = getIdsFromUrl(url);

  return ids.at(-1) ?? 0;
}

function getIdsFromUrl(url: string): number[] {
  return Array.from(
    url.matchAll(/\/(\d+)/g)
  ).map((match) => Number(match[1]));
}
