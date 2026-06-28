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
      descripcion: 'Recorre murallas, plazas y la esencia histórica del Caribe colombiano.',
      imagen: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1400&auto=format&fit=crop'
    },
    {
      titulo: 'Café & Montaña',
      descripcion: 'Vive una experiencia cultural y natural entre paisajes cafeteros.',
      imagen: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop'
    },
    {
      titulo: 'Aventura en la Naturaleza',
      descripcion: 'Explora destinos con guías preparados y experiencias memorables.',
      imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1400&auto=format&fit=crop'
    }
  ];

  beneficios = [
    {
      icono: '🌍',
      titulo: 'Experiencias auténticas',
      texto: 'Conecta con destinos, cultura local y recorridos diseñados para turistas nacionales e internacionales.'
    },
    {
      icono: '🧭',
      titulo: 'Guías especializados',
      texto: 'Trabaja con guías preparados para acompañar grupos y viajeros de forma profesional.'
    },
    {
      icono: '💳',
      titulo: 'Reservas y pagos simples',
      texto: 'Gestiona reservas, estados y pagos desde una plataforma clara y organizada.'
    },
    {
      icono: '📍',
      titulo: 'Mapa interactivo',
      texto: 'Descubre destinos, tours activos y puntos de interés de manera visual.'
    }
  ];

  pasos = [
    'Explora los tours disponibles',
    'Reserva tu experiencia',
    'Realiza tu pago de forma segura',
    'Disfruta el tour con acompañamiento profesional'
  ];
}
