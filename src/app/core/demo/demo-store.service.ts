import { Injectable } from '@angular/core';

import { Tour } from '../models/tour.model';
import { TourCreate } from '../models/tour-create.model';

import {
  DemoApiError,
  DemoTour,
  DemoUser
} from './demo.models';

import {
  DEMO_TOURS,
  DEMO_USERS
} from './demo.fixtures';

@Injectable({
  providedIn: 'root'
})
export class DemoStoreService {
  private readonly usersStorageKey = 'turismo_demo_v2_users';
  private readonly toursStorageKey = 'turismo_demo_v2_tours';

  private readonly defaultImage =
    'https://placehold.co/1200x800/e2e8f0/475569?text=TurismoApp';

  constructor() {
    this.initialize();
  }

  getUsers(): DemoUser[] {
    return this.clone(
      this.read<DemoUser[]>(
        this.usersStorageKey,
        []
      )
    );
  }

  findUserByEmail(email: string): DemoUser | null {
    const normalizedEmail = email.trim().toLowerCase();

    const user = this.getUsers().find(
      (item) => item.email === normalizedEmail
    );

    return user ? this.clone(user) : null;
  }

  createUser(
    user: Omit<DemoUser, 'id'>
  ): DemoUser {
    const users = this.getUsers();

    const newUser: DemoUser = {
      ...user,
      id: this.getNextId(users)
    };

    users.push(newUser);
    this.write(this.usersStorageKey, users);

    return this.clone(newUser);
  }

  getTours(): DemoTour[] {
    return this.clone(
      this.read<DemoTour[]>(
        this.toursStorageKey,
        []
      )
    );
  }

  getActiveTours(): DemoTour[] {
    return this.getTours().filter(
      (tour) => tour.activo
    );
  }

  getTourById(id: number): DemoTour | null {
    const tour = this.getTours().find(
      (item) => item.id === id
    );

    return tour ? this.clone(tour) : null;
  }

  createTour(payload: TourCreate): DemoTour {
    const tours = this.getTours();

    const tour = this.buildTour(
      payload,
      {
        id: this.getNextId(tours),
        activo: true
      }
    );

    tours.push(tour);
    this.write(this.toursStorageKey, tours);

    return this.clone(tour);
  }

  updateTour(
    id: number,
    payload: TourCreate
  ): DemoTour {
    const tours = this.getTours();

    const index = tours.findIndex(
      (tour) => tour.id === id
    );

    if (index === -1) {
      throw new DemoApiError(
        404,
        'Tour no encontrado.'
      );
    }

    const updatedTour = this.buildTour(
      payload,
      {
        id,
        activo: tours[index].activo,
        current: tours[index]
      }
    );

    tours[index] = updatedTour;
    this.write(this.toursStorageKey, tours);

    return this.clone(updatedTour);
  }

  changeTourStatus(
    id: number,
    activo: boolean
  ): void {
    const tours = this.getTours();

    const index = tours.findIndex(
      (tour) => tour.id === id
    );

    if (index === -1) {
      throw new DemoApiError(
        404,
        'Tour no encontrado.'
      );
    }

    tours[index] = {
      ...tours[index],
      activo
    };

    this.write(this.toursStorageKey, tours);
  }

  deleteTour(id: number): void {
    const tours = this.getTours();

    const tourExists = tours.some(
      (tour) => tour.id === id
    );

    if (!tourExists) {
      throw new DemoApiError(
        404,
        'Tour no encontrado.'
      );
    }

    this.write(
      this.toursStorageKey,
      tours.filter((tour) => tour.id !== id)
    );
  }

  resetDemoData(): void {
    localStorage.removeItem(this.usersStorageKey);
    localStorage.removeItem(this.toursStorageKey);

    this.initialize();
  }

  private initialize(): void {
    if (!localStorage.getItem(this.usersStorageKey)) {
      this.write(
        this.usersStorageKey,
        this.clone(DEMO_USERS)
      );
    }

    if (!localStorage.getItem(this.toursStorageKey)) {
      this.write(
        this.toursStorageKey,
        this.clone(DEMO_TOURS)
      );
    }
  }

  private buildTour(
    payload: TourCreate,
    options: {
      id: number;
      activo: boolean;
      current?: Tour;
    }
  ): DemoTour {
    const current = options.current;

    const nombre = this.getText(
      payload.nombre,
      current?.nombre ?? ''
    );

    const precio = this.getNumber(
      payload.precio,
      current?.precio ?? 0
    );

    if (!nombre) {
      throw new DemoApiError(
        400,
        'El nombre del tour es obligatorio.'
      );
    }

    if (precio <= 0) {
      throw new DemoApiError(
        400,
        'El precio debe ser mayor que cero.'
      );
    }

    return {
      id: options.id,
      nombre,
      descripcion: this.getText(
        payload.descripcion,
        current?.descripcion ?? ''
      ),
      ciudad: this.getText(
        payload.ciudad,
        current?.ciudad ?? 'Bogotá'
      ),
      pais: this.getText(
        payload.pais,
        current?.pais ?? 'Colombia'
      ),
      imagenUrl: this.getText(
        payload.imagenUrl,
        current?.imagenUrl ?? this.defaultImage
      ),
      latitud: this.getNumber(
        payload.latitud,
        current?.latitud ?? 4.711
      ),
      longitud: this.getNumber(
        payload.longitud,
        current?.longitud ?? -74.0721
      ),
      precio,
      activo: options.activo
    };
  }

  private getText(
    value: unknown,
    fallback: string
  ): string {
    if (value === undefined || value === null) {
      return fallback;
    }

    return String(value).trim();
  }

  private getNumber(
    value: unknown,
    fallback: number
  ): number {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return fallback;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : fallback;
  }

  private getNextId(
    items: Array<{ id: number }>
  ): number {
    return Math.max(
      0,
      ...items.map((item) => item.id)
    ) + 1;
  }

  private read<T>(
    key: string,
    fallback: T
  ): T {
    try {
      const rawValue = localStorage.getItem(key);

      return rawValue
        ? JSON.parse(rawValue) as T
        : fallback;
    } catch {
      return fallback;
    }
  }

  private write(
    key: string,
    value: unknown
  ): void {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
