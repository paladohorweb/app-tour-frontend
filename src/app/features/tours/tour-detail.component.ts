import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { Tour } from '../../core/models/tour.model';
import { TourService } from '../../core/services/tour.service';

@Component({
  standalone: true,
  selector: 'app-tour-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './tour-detail.component.html',
  styleUrls: ['./tour-detail.component.css']
})
export class TourDetailComponent implements OnInit {
  readonly fallbackImage =
    'https://placehold.co/1200x720/e2e8f0/475569?text=TurismoApp';

  tour?: Tour;

  loading = true;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly tourService: TourService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        switchMap((id) => {
          if (!Number.isInteger(id) || id <= 0) {
            this.error = 'El identificador del tour no es válido.';
            return of(null);
          }

          this.loading = true;
          this.error = '';

          return this.tourService.obtenerPorId(id).pipe(
            catchError((err) => {
              console.error('Error obteniendo tour:', err);

              this.error =
                err?.error?.message ||
                'No fue posible cargar la información del tour.';

              return of(null);
            })
          );
        })
      )
      .subscribe((tour) => {
        this.tour = tour ?? undefined;
        this.loading = false;
      });
  }

  get tieneUbicacion(): boolean {
    return Boolean(
      this.tour &&
      Number.isFinite(this.tour.latitud) &&
      Number.isFinite(this.tour.longitud)
    );
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src !== this.fallbackImage) {
      image.src = this.fallbackImage;
    }
  }
}
