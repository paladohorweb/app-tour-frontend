import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  EstadoReserva,
  ReservaResponse,
  ReservaService
} from '../../core/services/reserva.service';

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
    private readonly route: ActivatedRoute,
    private readonly reservaService: ReservaService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const reservaId = Number(
        this.route.snapshot.queryParamMap.get('reservaId')
      );

      if (!Number.isInteger(reservaId) || reservaId <= 0) {
        throw new Error('La reserva consultada no es válida.');
      }

      this.reserva = await firstValueFrom(
        this.reservaService.obtenerReserva(reservaId)
      );
    } catch (err: any) {
      console.error('Error consultando estado de reserva:', err);

      this.error =
        err?.error?.message ||
        err?.message ||
        'No fue posible consultar el estado de la reserva.';
    } finally {
      this.loading = false;
    }
  }

  get tituloEstado(): string {
    switch (this.reserva?.estado) {
      case 'PAGADA':
        return 'Pago confirmado';

      case 'PENDIENTE':
        return 'Tu reserva está pendiente';

      case 'EN_CURSO':
        return 'Tu experiencia está en curso';

      case 'FINALIZADA':
        return 'Experiencia finalizada';

      case 'CANCELADA':
        return 'Reserva cancelada';

      case 'FALLIDA':
        return 'El pago no fue completado';

      default:
        return 'Estado de tu reserva';
    }
  }

  get descripcionEstado(): string {
    switch (this.reserva?.estado) {
      case 'PAGADA':
        return 'Tu pago fue confirmado. El administrador podrá asignar un guía a tu experiencia.';

      case 'PENDIENTE':
        return 'Completa el pago para confirmar la reserva.';

      case 'EN_CURSO':
        return 'Tu guía ya inició la experiencia. Disfruta el recorrido.';

      case 'FINALIZADA':
        return 'La experiencia fue completada correctamente.';

      case 'CANCELADA':
        return 'Esta reserva ya no está activa.';

      case 'FALLIDA':
        return 'El proceso de pago no se completó. Puedes intentar nuevamente desde tus reservas.';

      default:
        return 'Consulta los detalles de tu reserva.';
    }
  }

  get iconoEstado(): string {
    switch (this.reserva?.estado) {
      case 'PAGADA':
        return '✓';

      case 'PENDIENTE':
        return '⏳';

      case 'EN_CURSO':
        return '🧭';

      case 'FINALIZADA':
        return '★';

      case 'CANCELADA':
        return '—';

      case 'FALLIDA':
        return '!';

      default:
        return 'i';
    }
  }

  puedePagar(): boolean {
    return this.reserva?.estado === 'PENDIENTE';
  }

  estadoClase(estado?: EstadoReserva): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'status-badge status-pending';

      case 'PAGADA':
        return 'status-badge status-paid';

      case 'EN_CURSO':
        return 'status-badge status-progress';

      case 'FINALIZADA':
        return 'status-badge status-finished';

      case 'CANCELADA':
        return 'status-badge status-cancelled';

      case 'FALLIDA':
        return 'status-badge status-failed';

      default:
        return 'status-badge';
    }
  }
}
