import { Injectable } from '@angular/core';

export type DemoRole =
  | 'ROLE_ADMIN'
  | 'ROLE_GUIA'
  | 'ROLE_USER';

interface DemoUser {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: DemoRole;
}

interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  rol: string;
}

export interface DemoLoginResponse {
  accessToken: string;
  refreshToken: string;
  rol: DemoRole;
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

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {
  private readonly usersStorageKey = 'turismo_demo_users_v1';

  constructor() {
    this.seedUsers();
  }

  login(
    email: string,
    password: string
  ): DemoLoginResponse {
    const normalizedEmail = email.trim().toLowerCase();

    const user = this.getUsers().find(
      (item) =>
        item.email === normalizedEmail &&
        item.password === password
    );

    if (!user) {
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

  register(payload: RegisterPayload): {
    id: number;
    email: string;
    rol: DemoRole;
  } {
    const nombre = payload.nombre.trim();
    const email = payload.email.trim().toLowerCase();
    const password = payload.password;
    const rol = payload.rol as DemoRole;

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

    const users = this.getUsers();

    const exists = users.some(
      (user) => user.email === email
    );

    if (exists) {
      throw new DemoApiError(
        409,
        'Ya existe una cuenta con este correo.'
      );
    }

    const newUser: DemoUser = {
      id: this.getNextId(users),
      nombre,
      email,
      password,
      rol
    };

    users.push(newUser);
    this.saveUsers(users);

    return {
      id: newUser.id,
      email: newUser.email,
      rol: newUser.rol
    };
  }

  private seedUsers(): void {
    const existingUsers = localStorage.getItem(
      this.usersStorageKey
    );

    if (existingUsers) {
      return;
    }

    const users: DemoUser[] = [
      {
        id: 1,
        nombre: 'Administrador Demo',
        email: 'admin@demo.com',
        password: '123456',
        rol: 'ROLE_ADMIN'
      },
      {
        id: 2,
        nombre: 'Guía Demo',
        email: 'guia@demo.com',
        password: '123456',
        rol: 'ROLE_GUIA'
      },
      {
        id: 3,
        nombre: 'Viajero Demo',
        email: 'viajero@demo.com',
        password: '123456',
        rol: 'ROLE_USER'
      }
    ];

    this.saveUsers(users);
  }

  private getUsers(): DemoUser[] {
    const rawUsers = localStorage.getItem(
      this.usersStorageKey
    );

    if (!rawUsers) {
      return [];
    }

    try {
      return JSON.parse(rawUsers) as DemoUser[];
    } catch {
      return [];
    }
  }

  private saveUsers(users: DemoUser[]): void {
    localStorage.setItem(
      this.usersStorageKey,
      JSON.stringify(users)
    );
  }

  private getNextId(users: DemoUser[]): number {
    if (users.length === 0) {
      return 1;
    }

    return Math.max(
      ...users.map((user) => user.id)
    ) + 1;
  }

  private createToken(user: DemoUser): string {
    const header = this.encodeJwtPart({
      alg: 'none',
      typ: 'JWT'
    });

    const payload = this.encodeJwtPart({
      sub: user.email,
      nombre: user.nombre,
      role: user.rol,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
    });

    return `${header}.${payload}.demo-signature`;
  }

  private encodeJwtPart(value: object): string {
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
