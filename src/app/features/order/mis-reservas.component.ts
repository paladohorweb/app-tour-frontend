import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservaService, ReservaResponse } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.css']
})
export class MisReservasComponent implements OnInit {
  loading = true;
  error = '';
  reservas: ReservaResponse[] = [];

  constructor(
    private reservaService: ReservaService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';

    this.reservaService.mias().subscribe({
      next: (res) => {
        this.reservas = res ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudieron cargar tus reservas';
        this.loading = false;
      }
    });
  }

  badgeClass(estado: string) {
    switch (estado) {
      case 'PAGADA': return 'badge ok';
      case 'PENDIENTE': return 'badge warn';
      case 'CANCELADA': return 'badge cancel';
      case 'FALLIDA': return 'badge fail';
      default: return 'badge';
    }
  }
}
