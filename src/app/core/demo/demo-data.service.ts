import { Injectable } from '@angular/core';
import { Tour } from '../models/tour.model';
import { TourCreate } from '../models/tour-create.model';
import { RegisterResponse } from '../models/auth.model';
import { GuiaSimple } from '../services/admin.service';
import {
  EstadoReserva,
  MetodoPago,
  ReservaResponse
} from '../services/reserva.service';
import { CreateIntentResponse } from '../services/payment.service';

type DemoRole = 'ADMIN' | 'USER' | 'GUIA';

interface DemoState {
  tours: Tour[];
  reservas: ReservaResponse[];
  guias: GuiaSimple[];
}

const STORAGE_KEY = 'turismo_demo_state';

@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private state: DemoState = this.loadState();

  login(email: string): { accessToken: string; refreshToken: string; rol: string } {
    const role = this.roleFromEmail(email);

    return {
      accessToken: this.createToken(email || 'admin@demo.com', role),
      refreshToken: `demo-refresh-${role.toLowerCase()}`,
      rol: `ROLE_${role}`
    };
  }

  register(payload: { nombre: string; email: string; rol?: 'ROLE_USER' | 'ROLE_GUIA' }): RegisterResponse {
    const role = payload.rol ?? 'ROLE_USER';

    if (role === 'ROLE_GUIA') {
      const guia: GuiaSimple = {
        id: this.nextId(this.state.guias),
        nombre: payload.nombre || 'Guia Demo',
        email: payload.email
      };
      this.state.guias = [guia, ...this.state.guias];
      this.persist();
    }

    return {
      id: Date.now(),
      email: payload.email,
      rol: role
    };
  }

  listTours(includeInactive = false): Tour[] {
    const tours = [...this.state.tours];
    return includeInactive ? tours : tours.filter((tour) => tour.activo);
  }

  getTour(id: number): Tour {
    return this.state.tours.find((tour) => tour.id === id) ?? this.state.tours[0];
  }

  createTour(payload: TourCreate): Tour {
    const tour: Tour = {
      id: this.nextId(this.state.tours),
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? '',
      ciudad: payload.ciudad ?? 'Medellin',
      pais: payload.pais ?? 'Colombia',
      imagenUrl: payload.imagenUrl ?? '',
      latitud: payload.latitud ?? 6.2442,
      longitud: payload.longitud ?? -75.5812,
      precio: payload.precio,
      activo: true
    };

    this.state.tours = [tour, ...this.state.tours];
    this.persist();
    return tour;
  }

  updateTour(id: number, payload: TourCreate): Tour {
    const previous = this.getTour(id);
    const updated: Tour = {
      ...previous,
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? '',
      ciudad: payload.ciudad ?? '',
      pais: payload.pais ?? 'Colombia',
      imagenUrl: payload.imagenUrl ?? '',
      latitud: payload.latitud ?? previous.latitud,
      longitud: payload.longitud ?? previous.longitud,
      precio: payload.precio
    };

    this.state.tours = this.state.tours.map((tour) => tour.id === id ? updated : tour);
    this.persist();
    return updated;
  }

  toggleTour(id: number, activo: boolean): void {
    this.state.tours = this.state.tours.map((tour) =>
      tour.id === id ? { ...tour, activo } : tour
    );
    this.persist();
  }

  deleteTour(id: number): void {
    this.state.tours = this.state.tours.filter((tour) => tour.id !== id);
    this.persist();
  }

  createReserva(tourId: number): ReservaResponse {
    const tour = this.getTour(tourId);
    const reserva: ReservaResponse = {
      id: this.nextId(this.state.reservas),
      tourId: tour.id,
      tourNombre: tour.nombre,
      usuarioId: 1,
      emailCliente: 'cliente@demo.com',
      nombreCliente: 'Cliente Demo',
      monto: Number(tour.precio ?? 0),
      estado: 'PENDIENTE',
      metodoPago: null,
      paymentProvider: null,
      paymentReference: null,
      fechaCreacion: new Date().toISOString(),
      guiaId: null,
      guiaNombre: null,
      guiaEmail: null
    };

    this.state.reservas = [reserva, ...this.state.reservas];
    this.persist();
    return reserva;
  }

  getReserva(id: number): ReservaResponse {
    return this.state.reservas.find((reserva) => reserva.id === id) ?? this.state.reservas[0];
  }

  misReservas(): ReservaResponse[] {
    return [...this.state.reservas].filter((reserva) =>
      reserva.emailCliente === 'cliente@demo.com'
    );
  }

  adminReservas(estado?: EstadoReserva): ReservaResponse[] {
    const reservas = [...this.state.reservas];
    return estado ? reservas.filter((reserva) => reserva.estado === estado) : reservas;
  }

  cancelReserva(id: number): void {
    this.setReservaState(id, 'CANCELADA');
  }

  deleteReserva(id: number): void {
    this.state.reservas = this.state.reservas.filter((reserva) => reserva.id !== id);
    this.persist();
  }

  createPaymentIntent(reservaId: number, metodoPago: MetodoPago): CreateIntentResponse {
    const reserva = this.getReserva(reservaId);
    const reference = `DEMO-PAY-${reservaId}-${Date.now()}`;

    this.state.reservas = this.state.reservas.map((item) =>
      item.id === reservaId
        ? {
            ...item,
            estado: 'PAGADA',
            metodoPago,
            paymentProvider: metodoPago === 'TARJETA' ? 'STRIPE_DEMO' : metodoPago,
            paymentReference: reference,
            stripePaymentIntentId: metodoPago === 'TARJETA' ? reference : item.stripePaymentIntentId
          }
        : item
    );

    this.persist();

    return {
      clientSecret: metodoPago === 'TARJETA' ? `demo_secret_${reservaId}` : null,
      reservaId: reserva.id,
      provider: metodoPago === 'TARJETA' ? 'STRIPE_DEMO' : metodoPago,
      checkoutUrl: null,
      reference
    };
  }

  listGuias(): GuiaSimple[] {
    return [...this.state.guias];
  }

  assignGuia(reservaId: number, guiaId: number): void {
    const guia = this.state.guias.find((item) => item.id === guiaId);

    this.state.reservas = this.state.reservas.map((reserva) =>
      reserva.id === reservaId
        ? {
            ...reserva,
            guiaId: guia?.id ?? null,
            guiaNombre: guia?.nombre ?? null,
            guiaEmail: guia?.email ?? null
          }
        : reserva
    );

    this.persist();
  }

  guiaReservas(): ReservaResponse[] {
    return this.state.reservas.filter((reserva) => reserva.guiaId === 1);
  }

  iniciarReserva(id: number): void {
    this.setReservaState(id, 'EN_CURSO');
  }

  finalizarReserva(id: number): void {
    this.setReservaState(id, 'FINALIZADA');
  }

  private setReservaState(id: number, estado: EstadoReserva): void {
    this.state.reservas = this.state.reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, estado } : reserva
    );
    this.persist();
  }

  private loadState(): DemoState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as DemoState;
    }

    return this.seedState();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private seedState(): DemoState {
    const now = new Date();
    const at = (days: number): string => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date.toISOString();
    };

    const tours: Tour[] = [
      {
        id: 1,
        nombre: 'Guatape y Piedra del Penol',
        descripcion: 'Recorrido de dia completo por uno de los destinos mas coloridos de Antioquia, con miradores, embalse y cultura local.',
        ciudad: 'Guatape',
        pais: 'Colombia',
        imagenUrl: 'https://images.unsplash.com/photo-1627149762114-11eb8ba37097?q=85&w=1400&auto=format&fit=crop',
        latitud: 6.2327,
        longitud: -75.1586,
        precio: 180000,
        activo: true
      },
      {
        id: 2,
        nombre: 'Centro historico de Cartagena',
        descripcion: 'Experiencia cultural por calles coloniales, plazas, murallas y sabores del Caribe colombiano.',
        ciudad: 'Cartagena',
        pais: 'Colombia',
        imagenUrl: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=85&w=1400&auto=format&fit=crop',
        latitud: 10.4236,
        longitud: -75.5378,
        precio: 220000,
        activo: true
      },
      {
        id: 3,
        nombre: 'Cafe de origen en Salento',
        descripcion: 'Ruta cafetera con finca local, cata, paisaje andino y visita al valle del Cocora.',
        ciudad: 'Salento',
        pais: 'Colombia',
        imagenUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=85&w=1400&auto=format&fit=crop',
        latitud: 4.6369,
        longitud: -75.5703,
        precio: 160000,
        activo: true
      },
      {
        id: 4,
        nombre: 'Comuna 13 arte y memoria',
        descripcion: 'Tour urbano por escaleras electricas, murales, musica local y transformacion social.',
        ciudad: 'Medellin',
        pais: 'Colombia',
        imagenUrl: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=85&w=1400&auto=format&fit=crop',
        latitud: 6.2442,
        longitud: -75.5812,
        precio: 95000,
        activo: true
      }
    ];

    const guias: GuiaSimple[] = [
      { id: 1, nombre: 'Laura Montoya', email: 'guia@demo.com' },
      { id: 2, nombre: 'Mateo Restrepo', email: 'mateo.guia@demo.com' },
      { id: 3, nombre: 'Camila Torres', email: 'camila.guia@demo.com' }
    ];

    return {
      tours,
      guias,
      reservas: [
        {
          id: 101,
          tourId: 1,
          tourNombre: tours[0].nombre,
          usuarioId: 1,
          emailCliente: 'cliente@demo.com',
          nombreCliente: 'Cliente Demo',
          monto: 180000,
          estado: 'PENDIENTE',
          metodoPago: null,
          paymentProvider: null,
          fechaCreacion: at(0),
          guiaId: null,
          guiaNombre: null,
          guiaEmail: null
        },
        {
          id: 102,
          tourId: 2,
          tourNombre: tours[1].nombre,
          usuarioId: 2,
          emailCliente: 'andres@demo.com',
          nombreCliente: 'Andres Ramirez',
          monto: 220000,
          estado: 'PAGADA',
          metodoPago: 'TARJETA',
          paymentProvider: 'STRIPE_DEMO',
          paymentReference: 'DEMO-102',
          fechaCreacion: at(-1),
          guiaId: null,
          guiaNombre: null,
          guiaEmail: null
        },
        {
          id: 103,
          tourId: 3,
          tourNombre: tours[2].nombre,
          usuarioId: 3,
          emailCliente: 'maria@demo.com',
          nombreCliente: 'Maria Gomez',
          monto: 160000,
          estado: 'EN_CURSO',
          metodoPago: 'PSE',
          paymentProvider: 'PSE',
          paymentReference: 'DEMO-103',
          fechaCreacion: at(-2),
          guiaId: 1,
          guiaNombre: guias[0].nombre,
          guiaEmail: guias[0].email
        },
        {
          id: 104,
          tourId: 4,
          tourNombre: tours[3].nombre,
          usuarioId: 4,
          emailCliente: 'sofia@demo.com',
          nombreCliente: 'Sofia Marin',
          monto: 95000,
          estado: 'FINALIZADA',
          metodoPago: 'NEQUI',
          paymentProvider: 'NEQUI',
          paymentReference: 'DEMO-104',
          fechaCreacion: at(-5),
          guiaId: 1,
          guiaNombre: guias[0].nombre,
          guiaEmail: guias[0].email
        }
      ]
    };
  }

  private nextId(items: Array<{ id: number }>): number {
    return Math.max(0, ...items.map((item) => item.id)) + 1;
  }

  private roleFromEmail(email: string): DemoRole {
    const value = email.toLowerCase();
    if (value.includes('admin')) return 'ADMIN';
    if (value.includes('guia')) return 'GUIA';
    return 'USER';
  }

  private createToken(email: string, role: DemoRole): string {
    const header = this.base64Url({ alg: 'none', typ: 'JWT' });
    const payload = this.base64Url({
      sub: email,
      email,
      nombre: role === 'ADMIN' ? 'Administrador Demo' : role === 'GUIA' ? 'Guia Demo' : 'Cliente Demo',
      role: `ROLE_${role}`,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    });

    return `${header}.${payload}.demo`;
  }

  private base64Url(value: Record<string, unknown>): string {
    return btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
