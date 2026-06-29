import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Tour } from '../../core/models/tour.model';
import { TourService } from '../../core/services/tour.service';

type OrdenTours = 'RELEVANCIA' | 'PRECIO_ASC' | 'PRECIO_DESC' | 'NOMBRE';

@Component({
  standalone: true,
  selector: 'app-tour-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tour-list.component.html',
  styleUrls: ['./tour-list.component.css']
})
export class TourListComponent implements OnInit {
  readonly fallbackImage =
    'https://placehold.co/900x560/e2e8f0/475569?text=TurismoApp';

  tours: Tour[] = [];

  loading = true;
  error = '';

  busqueda = '';
  ciudadFiltro = 'TODAS';
  orden: OrdenTours = 'RELEVANCIA';

  constructor(private readonly tourService: TourService) {}

  ngOnInit(): void {
    this.cargarTours();
  }

  cargarTours(): void {
    this.loading = true;
    this.error = '';

    this.tourService.listar().subscribe({
      next: (tours) => {
        this.tours = tours ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando tours:', err);
        this.error =
          err?.error?.message ||
          'No fue posible cargar los tours disponibles.';
        this.loading = false;
      }
    });
  }

  get ciudades(): string[] {
    return Array.from(
      new Set(
        this.tours
          .map((tour) => tour.ciudad?.trim())
          .filter((ciudad): ciudad is string => Boolean(ciudad))
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  get toursFiltrados(): Tour[] {
    const texto = this.busqueda.trim().toLowerCase();

    let resultado = [...this.tours].filter((tour) => tour.activo !== false);

    if (this.ciudadFiltro !== 'TODAS') {
      resultado = resultado.filter(
        (tour) => tour.ciudad === this.ciudadFiltro
      );
    }

    if (texto) {
      resultado = resultado.filter((tour) =>
        [
          tour.nombre,
          tour.descripcion,
          tour.ciudad,
          tour.pais
        ]
          .filter(Boolean)
          .some((valor) => valor.toLowerCase().includes(texto))
      );
    }

    return resultado.sort((a, b) => {
      switch (this.orden) {
        case 'PRECIO_ASC':
          return Number(a.precio ?? 0) - Number(b.precio ?? 0);

        case 'PRECIO_DESC':
          return Number(b.precio ?? 0) - Number(a.precio ?? 0);

        case 'NOMBRE':
          return a.nombre.localeCompare(b.nombre);

        default:
          return a.id - b.id;
      }
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src !== this.fallbackImage) {
      image.src = this.fallbackImage;
    }
  }

  trackByTour(_: number, tour: Tour): number {
    return tour.id;
  }
}
