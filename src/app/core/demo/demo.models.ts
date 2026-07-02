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
