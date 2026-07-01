import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Destacado {
  titulo: string;
  descripcion: string;
  ciudad: string;
  precio: string;
  imagen: string;
  posicion: string;
}

@Component({
  standalone: true,
  selector: 'app-landing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  readonly fallbackImage =
    'https://placehold.co/1200x800/e2e8f0/475569?text=TurismoApp';

  readonly heroImage =
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=1800&auto=format&fit=crop';

  destacados: Destacado[] = [
    {
      titulo: 'Cartagena Colonial',
      descripcion:
        'Murallas, plazas históricas, gastronomía caribeña y acompañamiento profesional.',
      ciudad: 'Cartagena',
      precio: '180.000',
      imagen:
        'https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=85&w=1400&auto=format&fit=crop',
      posicion: 'center 52%'
    },
    {
      titulo: 'Café y Montaña',
      descripcion:
        'Paisajes cafeteros, tradición local y rutas naturales para conectar con Colombia.',
      ciudad: 'Salento',
      precio: '220.000',
      imagen:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=85&w=1400&auto=format&fit=crop',
      posicion: 'center 52%'
    },
    {
      titulo: 'Medellín Cultural',
      descripcion:
        'Arte urbano, transformación social, miradores y experiencias urbanas memorables.',
      ciudad: 'Medellín',
      precio: '150.000',
      imagen:
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=85&w=1400&auto=format&fit=crop',
      posicion: 'center 45%'
    }
  ];

  beneficios = [
    {
      icono: '🌍',
      titulo: 'Experiencias auténticas',
      texto:
        'Tours pensados para conectar viajeros con cultura local, naturaleza y destinos reales.'
    },
    {
      icono: '🧭',
      titulo: 'Guías especializados',
      texto:
        'Acompañamiento profesional para viajeros nacionales e internacionales.'
    },
    {
      icono: '💳',
      titulo: 'Pagos adaptados',
      texto:
        'Reservas y pagos preparados para métodos habituales en Colombia.'
    },
    {
      icono: '📍',
      titulo: 'Mapa interactivo',
      texto:
        'Explora destinos disponibles y ubica experiencias desde una vista moderna.'
    }
  ];

  pasos = [
    'Explora los tours disponibles',
    'Elige una experiencia para tu viaje',
    'Reserva y realiza el pago',
    'Disfruta el recorrido con tu guía'
  ];

  metricas = [
    {
      valor: '24/7',
      label: 'Experiencias disponibles'
    },
    {
      valor: '3 roles',
      label: 'Viajero, guía y admin'
    },
    {
      valor: '100%',
      label: 'Experiencia responsive'
    }
  ];

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src !== this.fallbackImage) {
      image.src = this.fallbackImage;
    }
  }
}
