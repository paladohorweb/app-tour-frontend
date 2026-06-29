import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import {
  EstadoReserva,
  ReservaResponse,
  ReservaService
} from '../../core/services/reserva.service';

type FiltroEstado = EstadoReserva | 'TODOS';

@Component({
  standalone: true,
  selector: 'app-mis-reservas',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.css']
})
export class MisReservasComponent implements OnInit {
  loading = true;
  error = '';

  reservas: ReservaResponse[] = [];

  filtro = '';
  estadoFiltro: FiltroEstado = 'TODOS';

  accionandoId: number | null = null;

  constructor(private readonly reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';

    this.reservaService.mias().subscribe({
      next: (reservas) => {
        this.reservas = reservas ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando mis reservas:', err);
        this.error =
          err?.error?.message ||
          'No se pudieron cargar tus reservas.';
        this.loading = false;
      }
    });
  }

  get reservasFiltradas(): ReservaResponse[] {
    const termino = this.filtro.trim().toLowerCase();

    let resultado = [...this.reservas];

    if (this.estadoFiltro !== 'TODOS') {
      resultado = resultado.filter(
        (reserva) => reserva.estado === this.estadoFiltro
      );
    }

    if (termino) {
      resultado = resultado.filter((reserva) =>
        [
          reserva.tourNombre,
          reserva.estado,
          reserva.metodoPago,
          reserva.paymentProvider
        ]
          .filter(Boolean)
          .some((valor) => String(valor).toLowerCase().includes(termino))
      );
    }

    return resultado.sort(
      (a, b) =>
        this.obtenerFecha(b.fechaCreacion) -
        this.obtenerFecha(a.fechaCreacion)
    );
  }

  get totalReservas(): number {
    return this.reservas.length;
  }

  get pendientesPago(): number {
    return this.contarPorEstado('PENDIENTE');
  }

  get activas(): number {
    return this.reservas.filter((reserva) =>
      ['PAGADA', 'EN_CURSO'].includes(reserva.estado)
    ).length;
  }

  get finalizadas(): number {
    return this.contarPorEstado('FINALIZADA');
  }

  puedePagar(reserva: ReservaResponse): boolean {
    return reserva.estado === 'PENDIENTE';
  }

  puedeCancelar(reserva: ReservaResponse): boolean {
    return reserva.estado === 'PENDIENTE';
  }

  puedeEliminar(reserva: ReservaResponse): boolean {
    return ['PENDIENTE', 'CANCELADA', 'FALLIDA'].includes(reserva.estado);
  }

  async cancelar(reserva: ReservaResponse): Promise<void> {
    if (!this.puedeCancelar(reserva)) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Cancelar reserva?',
      text: `Vas a cancelar la reserva #${reserva.id}: ${reserva.tourNombre}`,
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#b45309'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.accionandoId = reserva.id;

    this.reservaService.cancelar(reserva.id).subscribe({
      next: async () => {
        this.accionandoId = null;
        this.cargar();

        await Swal.fire({
          icon: 'success',
          title: 'Reserva cancelada',
          text: 'La reserva fue cancelada correctamente.',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error cancelando reserva:', err);
        this.accionandoId = null;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo cancelar',
          text:
            err?.error?.message ||
            'Ocurrió un error al cancelar la reserva.'
        });
      }
    });
  }

  async eliminar(reserva: ReservaResponse): Promise<void> {
    if (!this.puedeEliminar(reserva)) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar reserva?',
      text: `Vas a eliminar la reserva #${reserva.id}: ${reserva.tourNombre}`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b91c1c',
      reverseButtons: true
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.accionandoId = reserva.id;

    this.reservaService.eliminar(reserva.id).subscribe({
      next: async () => {
        this.accionandoId = null;
        this.cargar();

        await Swal.fire({
          icon: 'success',
          title: 'Reserva eliminada',
          text: 'La reserva fue eliminada correctamente.',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error eliminando reserva:', err);
        this.accionandoId = null;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo eliminar',
          text:
            err?.error?.message ||
            'Ocurrió un error al eliminar la reserva.'
        });
      }
    });
  }

  estadoClase(estado: EstadoReserva): string {
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

  esAccionando(reserva: ReservaResponse): boolean {
    return this.accionandoId === reserva.id;
  }

  trackByReserva(_: number, reserva: ReservaResponse): number {
    return reserva.id;
  }

  private contarPorEstado(estado: EstadoReserva): number {
    return this.reservas.filter(
      (reserva) => reserva.estado === estado
    ).length;
  }

  private obtenerFecha(fecha?: string): number {
    if (!fecha) {
      return 0;
    }

    const timestamp = new Date(fecha).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
