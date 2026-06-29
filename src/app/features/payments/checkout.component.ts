import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { ReservaService } from '../../core/services/reserva.service';
import { TourService } from '../../core/services/tour.service';
import { Tour } from '../../core/models/tour.model';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  readonly fallbackImage =
    'https://placehold.co/1200x720/e2e8f0/475569?text=TurismoApp';

  tour?: Tour;

  loading = true;
  creandoReserva = false;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly tourService: TourService,
    private readonly reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    const tourId = Number(this.route.snapshot.paramMap.get('tourId'));

    if (!Number.isInteger(tourId) || tourId <= 0) {
      this.error = 'El tour seleccionado no es válido.';
      this.loading = false;
      return;
    }

    this.tourService.obtenerPorId(tourId).subscribe({
      next: (tour) => {
        this.tour = tour;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando tour para checkout:', err);

        this.error =
          err?.error?.message ||
          'No fue posible cargar la información del tour.';

        this.loading = false;
      }
    });
  }

  reservar(): void {
    if (!this.tour || !this.tour.activo) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      Swal.fire({
        icon: 'info',
        title: 'Inicia sesión para continuar',
        text: 'Debes iniciar sesión o crear una cuenta antes de realizar una reserva.',
        showCancelButton: true,
        confirmButtonText: 'Ir al inicio de sesión',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0f172a'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login'], {
            queryParams: {
              returnUrl: `/checkout/${this.tour?.id}`
            }
          });
        }
      });

      return;
    }

    this.creandoReserva = true;

    this.reservaService.crearReserva(this.tour.id).subscribe({
      next: (reserva) => {
        this.creandoReserva = false;
        this.router.navigate(['/pago', reserva.id]);
      },
      error: async (err) => {
        console.error('Error creando reserva:', err);
        this.creandoReserva = false;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo crear la reserva',
          text:
            err?.error?.message ||
            'Ocurrió un error al crear la reserva. Intenta nuevamente.'
        });
      }
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src !== this.fallbackImage) {
      image.src = this.fallbackImage;
    }
  }
}
