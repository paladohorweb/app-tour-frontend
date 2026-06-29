import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-landing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  destacados = [
    {
      titulo: 'Cartagena Colonial',
      descripcion: 'Murallas, plazas históricas, cultura caribeña y acompañamiento profesional.',
      ciudad: 'Cartagena',
      precio: '180.000',
      imagen: 'https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=1400&auto=format&fit=crop'
    },
    {
      titulo: 'Café & Montaña',
      descripcion: 'Vive paisajes cafeteros, tradición local y rutas naturales memorables.',
      ciudad: 'Salento',
      precio: '220.000',
      imagen: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop'
    },
    {
      titulo: 'Medellín Cultural',
      descripcion: 'Arte urbano, transformación social, miradores y experiencias urbanas.',
      ciudad: 'Medellín',
      precio: '150.000',
      imagen: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop'
    }
  ];

  beneficios = [
    {
      icono: '🌍',
      titulo: 'Experiencias auténticas',
      texto: 'Tours diseñados para conectar viajeros con cultura local, naturaleza y destinos reales.'
    },
    {
      icono: '🧭',
      titulo: 'Guías especializados',
      texto: 'Acompañamiento profesional para viajeros nacionales y extranjeros.'
    },
    {
      icono: '💳',
      titulo: 'Pagos adaptados a Colombia',
      texto: 'Flujo preparado para pagos con métodos locales y reservas controladas.'
    },
    {
      icono: '📍',
      titulo: 'Mapa interactivo',
      texto: 'Visualiza destinos disponibles y puntos turísticos desde una experiencia moderna.'
    }
  ];

  pasos = [
    'Explora tours disponibles',
    'Elige una experiencia',
    'Reserva y paga de forma segura',
    'Disfruta tu tour con guía profesional'
  ];

  metricas = [
    { valor: '24/7', label: 'Catálogo disponible' },
    { valor: '3 roles', label: 'Usuario, guía y admin' },
    { valor: '100%', label: 'Responsive' }
  ];
}
