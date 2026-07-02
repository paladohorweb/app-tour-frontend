import { DemoUser, DemoTour } from './demo.models';

export const DEMO_USERS: DemoUser[] = [
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

export const DEMO_TOURS: DemoTour[] = [
  {
    id: 1,
    nombre: 'Cartagena histórica y bahía',
    descripcion:
      'Recorre el centro histórico, las murallas, plazas emblemáticas y la bahía de Cartagena con acompañamiento local.',
    ciudad: 'Cartagena',
    pais: 'Colombia',
    imagenUrl:
      'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=1200&q=85',
    latitud: 10.391,
    longitud: -75.4794,
    precio: 220000,
    activo: true
  },
  {
    id: 2,
    nombre: 'Guatapé y Piedra del Peñol',
    descripcion:
      'Una experiencia de naturaleza, paisajes antioqueños y una vista inolvidable desde uno de los miradores más reconocidos del país.',
    ciudad: 'Guatapé',
    pais: 'Colombia',
    imagenUrl:
      'https://images.unsplash.com/photo-1596395819057-e37f55a851a7?auto=format&fit=crop&w=1200&q=85',
    latitud: 6.233,
    longitud: -75.158,
    precio: 185000,
    activo: true
  },
  {
    id: 3,
    nombre: 'Salento y Valle de Cocora',
    descripcion:
      'Explora el paisaje cultural cafetero, senderos naturales y las palmas de cera del Valle de Cocora.',
    ciudad: 'Salento',
    pais: 'Colombia',
    imagenUrl:
      'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=85',
    latitud: 4.637,
    longitud: -75.57,
    precio: 195000,
    activo: true
  },
  {
    id: 4,
    nombre: 'Medellín urbana y Comuna 13',
    descripcion:
      'Descubre arte urbano, transformación social, historia local y miradores de Medellín.',
    ciudad: 'Medellín',
    pais: 'Colombia',
    imagenUrl:
      'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=1200&q=85',
    latitud: 6.2442,
    longitud: -75.5812,
    precio: 160000,
    activo: true
  },
  {
    id: 5,
    nombre: 'Aventura en San Andrés',
    descripcion:
      'Recorrido de playa, mar y actividades para descubrir el Caribe colombiano.',
    ciudad: 'San Andrés',
    pais: 'Colombia',
    imagenUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    latitud: 12.5847,
    longitud: -81.7006,
    precio: 260000,
    activo: false
  }
];
