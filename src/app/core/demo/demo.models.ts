import { Tour } from '../models/tour.model';

export type DemoRole =
  | 'ROLE_ADMIN'
  | 'ROLE_GUIA'
  | 'ROLE_USER';

export interface DemoUser {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: DemoRole;
}

export interface DemoRegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: 'ROLE_USER' | 'ROLE_GUIA';
}

export interface DemoLoginResponse {
  accessToken: string;
  refreshToken: string;
  rol: DemoRole;
}

export interface DemoJwtPayload {
  sub: string;
  nombre: string;
  role: DemoRole;
  exp: number;
}
export type DemoReservationStatus =
  | 'PENDIENTE'
  | 'PAGADA'
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'CANCELADA'
  | 'FALLIDA';

export type DemoPaymentMethod =
  | 'TARJETA'
  | 'PSE'
  | 'NEQUI'
  | 'DAVIPLATA'
  | 'TRANSFERENCIA'
  | 'EFECTIVO';

export interface DemoReservation {
  id: number;
  tourId: number;
  tourNombre: string;

  usuarioId: number;
  emailCliente: string;
  nombreCliente: string;

  monto: number;
  estado: DemoReservationStatus;

  metodoPago?: DemoPaymentMethod | null;
  paymentProvider?: string | null;
  externalPaymentId?: string | null;
  paymentRedirectUrl?: string | null;
  paymentReference?: string | null;
  stripePaymentIntentId?: string | null;

  fechaCreacion: string;

  guiaId?: number | null;
  guiaNombre?: string | null;
  guiaEmail?: string | null;
}

export interface DemoPaymentIntentResponse {
  clientSecret: string;
  reservaId: number;
  provider: 'DEMO';
  checkoutUrl: null;
  reference: string;
}

export class DemoApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'DemoApiError';
  }
}

export type DemoTour = Tour;
