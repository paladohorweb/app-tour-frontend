import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DEMO_MODE } from '../constants/demo.constants';
import { EstadoReserva } from '../services/reserva.service';
import { DemoDataService } from './demo-data.service';

export const demoApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!DEMO_MODE) {
    return next(req);
  }

  const demo = inject(DemoDataService);
  const url = req.url.split('?')[0];
  const params = new URL(req.url, window.location.origin).searchParams;
  const method = req.method.toUpperCase();
  const body = req.body as any;

  const respond = <T>(payload: T): Observable<HttpResponse<T>> =>
    of(new HttpResponse({ status: 200, body: payload }));

  if (method === 'POST' && url.endsWith('/auth/login')) {
    return respond(demo.login(body?.email ?? 'admin@demo.com'));
  }

  if (method === 'POST' && url.endsWith('/auth/register')) {
    return respond(demo.register(body));
  }

  if (method === 'GET' && url.endsWith('/admin/tours')) {
    return respond(demo.listTours(true));
  }

  if (method === 'GET' && url.endsWith('/tours')) {
    return respond(demo.listTours(false));
  }

  if (method === 'POST' && url.endsWith('/tours')) {
    return respond(demo.createTour(body));
  }

  if (method === 'GET' && /\/tours\/\d+$/.test(url)) {
    return respond(demo.getTour(idFromUrl(url)));
  }

  if (method === 'PUT' && /\/tours\/\d+$/.test(url)) {
    return respond(demo.updateTour(idFromUrl(url), body));
  }

  if (method === 'DELETE' && /\/tours\/\d+$/.test(url)) {
    demo.deleteTour(idFromUrl(url));
    return respond(null);
  }

  if (method === 'PATCH' && url.endsWith('/activo')) {
    demo.toggleTour(idFromUrl(url), Boolean(body?.activo));
    return respond(null);
  }

  if (method === 'POST' && url.endsWith('/reservas')) {
    return respond(demo.createReserva(Number(body?.tourId)));
  }

  if (method === 'GET' && url.endsWith('/reservas/mias')) {
    return respond(demo.misReservas());
  }

  if (method === 'GET' && /\/reservas\/\d+$/.test(url)) {
    return respond(demo.getReserva(idFromUrl(url)));
  }

  if (method === 'PATCH' && url.endsWith('/cancelar')) {
    demo.cancelReserva(idFromUrl(url));
    return respond(null);
  }

  if (method === 'DELETE' && /\/reservas\/\d+$/.test(url)) {
    demo.deleteReserva(idFromUrl(url));
    return respond(null);
  }

  if (method === 'POST' && url.endsWith('/pagos/crear-intent')) {
    return respond(demo.createPaymentIntent(Number(body?.reservaId), body?.metodoPago));
  }

  if (method === 'GET' && url.endsWith('/admin/reservas')) {
    const estado = params.get('estado') as EstadoReserva | null;
    return respond(demo.adminReservas(estado ?? undefined));
  }

  if (method === 'GET' && url.endsWith('/admin/guias')) {
    return respond(demo.listGuias());
  }

  if (method === 'PATCH' && url.includes('/admin/reservas/') && url.includes('/asignar-guia/')) {
    const ids = idsFromUrl(url);
    demo.assignGuia(ids[0], ids[1]);
    return respond(null);
  }

  if (method === 'GET' && url.endsWith('/guia/reservas')) {
    return respond(demo.guiaReservas());
  }

  if (method === 'PATCH' && url.endsWith('/iniciar')) {
    demo.iniciarReserva(idFromUrl(url));
    return respond(null);
  }

  if (method === 'PATCH' && url.endsWith('/finalizar')) {
    demo.finalizarReserva(idFromUrl(url));
    return respond(null);
  }

  return next(req);
};

function idFromUrl(url: string): number {
  const ids = idsFromUrl(url);
  return ids[ids.length - 1] ?? 0;
}

function idsFromUrl(url: string): number[] {
  return Array.from(url.matchAll(/\/(\d+)/g)).map((match) => Number(match[1]));
}
