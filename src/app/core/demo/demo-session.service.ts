import { Injectable } from '@angular/core';

import {
  DemoApiError,
  DemoJwtPayload,
  DemoLoginResponse,
  DemoRegisterRequest,
  DemoRole,
  DemoUser
} from './demo.models';

import { DemoStoreService } from './demo-store.service';

@Injectable({
  providedIn: 'root'
})
export class DemoSessionService {
  private readonly accessTokenKey = 'access_token';

  constructor(
    private readonly store: DemoStoreService
  ) {}

  login(
    email: string,
    password: string
  ): DemoLoginResponse {
    const user = this.store.findUserByEmail(email);

    if (!user || user.password !== password) {
      throw new DemoApiError(
        401,
        'Correo o contraseña incorrectos.'
      );
    }

    return {
      accessToken: this.createToken(user),
      refreshToken: `demo-refresh-${user.id}-${Date.now()}`,
      rol: user.rol
    };
  }

  register(payload: DemoRegisterRequest): {
    id: number;
    email: string;
    rol: DemoRole;
  } {
    const nombre = payload.nombre.trim();
    const email = payload.email.trim().toLowerCase();
    const password = payload.password;
    const rol = payload.rol;

    if (!nombre || !email || !password) {
      throw new DemoApiError(
        400,
        'Nombre, correo y contraseña son obligatorios.'
      );
    }

    if (
      rol !== 'ROLE_USER' &&
      rol !== 'ROLE_GUIA'
    ) {
      throw new DemoApiError(
        400,
        'Solo puedes crear cuentas de viajero o guía.'
      );
    }

    const userExists = this.store.findUserByEmail(email);

    if (userExists) {
      throw new DemoApiError(
        409,
        'Ya existe una cuenta con este correo.'
      );
    }

    const user = this.store.createUser({
      nombre,
      email,
      password,
      rol
    });

    return {
      id: user.id,
      email: user.email,
      rol: user.rol
    };
  }

  getCurrentUser(): DemoUser | null {
    const token = localStorage.getItem(this.accessTokenKey);

    if (!token) {
      return null;
    }

    const payload = this.decodeToken(token);

    if (!payload?.sub || this.isExpired(payload)) {
      return null;
    }

    return this.store.findUserByEmail(payload.sub);
  }

  requireRole(role: DemoRole): DemoUser {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      throw new DemoApiError(
        401,
        'Debes iniciar sesión para continuar.'
      );
    }

    if (currentUser.rol !== role) {
      throw new DemoApiError(
        403,
        'No tienes permisos para realizar esta acción.'
      );
    }

    return currentUser;
  }

  isCurrentUserAdmin(): boolean {
    return this.getCurrentUser()?.rol === 'ROLE_ADMIN';
  }

  private createToken(user: DemoUser): string {
    const header = this.encodeTokenPart({
      alg: 'none',
      typ: 'JWT'
    });

    const payload = this.encodeTokenPart({
      sub: user.email,
      nombre: user.nombre,
      role: user.rol,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
    });

    return `${header}.${payload}.demo-signature`;
  }

  private decodeToken(
    token: string
  ): DemoJwtPayload | null {
    try {
      const parts = token.split('.');

      if (parts.length < 2) {
        return null;
      }

      const payloadPart = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const padding = '='.repeat(
        (4 - (payloadPart.length % 4)) % 4
      );

      const binary = atob(
        `${payloadPart}${padding}`
      );

      const bytes = Uint8Array.from(
        binary,
        (character) => character.charCodeAt(0)
      );

      const decodedValue = new TextDecoder().decode(bytes);

      return JSON.parse(decodedValue) as DemoJwtPayload;
    } catch {
      return null;
    }
  }

  private isExpired(payload: DemoJwtPayload): boolean {
    return payload.exp * 1000 <= Date.now();
  }

  private encodeTokenPart(value: object): string {
    const bytes = new TextEncoder().encode(
      JSON.stringify(value)
    );

    let binary = '';

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
  }
}
