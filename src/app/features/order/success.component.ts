import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ReservaService, ReservaResponse } from '../../core/services/reserva.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {
  loading = true;
  error = '';
  reserva?: ReservaResponse;

  constructor(
    private route: ActivatedRoute,
    private reservaService: ReservaService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const reservaId = Number(this.route.snapshot.queryParamMap.get('reservaId'));
      if (!reservaId) throw new Error('reservaId inválido');

      this.reserva = await firstValueFrom(this.reservaService.obtenerReserva(reservaId));
      this.loading = false;
    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || e?.message || 'No se pudo consultar la reserva';
      this.loading = false;
    }
  }

  badgeClass(estado?: string): string {
    switch (estado) {
      case 'PAGADA': return 'bg-success-subtle text-success';
      case 'PENDIENTE': return 'bg-warning-subtle text-warning-emphasis';
      case 'FINALIZADA': return 'bg-info-subtle text-info-emphasis';
      case 'CANCELADA': return 'bg-secondary-subtle text-secondary-emphasis';
      case 'FALLIDA': return 'bg-danger-subtle text-danger-emphasis';
      default: return 'bg-light text-dark';
    }
  }
}
