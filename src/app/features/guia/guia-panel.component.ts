import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { GuiaService } from '../../core/services/guia.service';
import {
  EstadoReserva,
  ReservaResponse
} from '../../core/services/reserva.service';

type FiltroEstado = EstadoReserva | 'TODOS';

@Component({
  standalone: true,
  selector: 'app-guia-panel',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './guia-panel.component.html',
  styleUrls: ['./guia-panel.component.css']
})
export class GuiaPanelComponent implements OnInit {
  loading = true;
  error = '';

  reservas: ReservaResponse[] = [];

  filtro = '';
  estadoFiltro: FiltroEstado = 'TODOS';

  accionandoId: number | null = null;

  constructor(private readonly guiaService: GuiaService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;
    this.error = '';

    this.guiaService.misReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando reservas del guía:', err);
        this.error =
          err?.error?.message ||
          'No fue posible cargar las reservas asignadas.';
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
          reserva.nombreCliente,
          reserva.emailCliente,
          reserva.estado,
          reserva.metodoPago
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

  get pendientesInicio(): number {
    return this.contarPorEstado('PAGADA');
  }

  get enCurso(): number {
    return this.contarPorEstado('EN_CURSO');
  }

  get finalizadas(): number {
    return this.contarPorEstado('FINALIZADA');
  }

  puedeIniciar(reserva: ReservaResponse): boolean {
    return reserva.estado === 'PAGADA';
  }

  puedeFinalizar(reserva: ReservaResponse): boolean {
    return reserva.estado === 'EN_CURSO';
  }

  async iniciarTour(reserva: ReservaResponse): Promise<void> {
    if (!this.puedeIniciar(reserva)) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: '¿Iniciar experiencia?',
      text: `Vas a iniciar la reserva #${reserva.id}: ${reserva.tourNombre}`,
      showCancelButton: true,
      confirmButtonText: 'Sí, iniciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1d4ed8'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.accionandoId = reserva.id;

    this.guiaService.iniciar(reserva.id).subscribe({
      next: async () => {
        this.actualizarEstadoLocal(reserva.id, 'EN_CURSO');
        this.accionandoId = null;

        await Swal.fire({
          icon: 'success',
          title: 'Tour iniciado',
          text: 'La reserva ahora está en curso.',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error iniciando tour:', err);
        this.accionandoId = null;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo iniciar',
          text:
            err?.error?.message ||
            'Ocurrió un error al iniciar la experiencia.'
        });
      }
    });
  }

  async finalizarTour(reserva: ReservaResponse): Promise<void> {
    if (!this.puedeFinalizar(reserva)) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: '¿Finalizar experiencia?',
      text: `Vas a finalizar la reserva #${reserva.id}: ${reserva.tourNombre}`,
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#15803d'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.accionandoId = reserva.id;

    this.guiaService.finalizar(reserva.id).subscribe({
      next: async () => {
        this.actualizarEstadoLocal(reserva.id, 'FINALIZADA');
        this.accionandoId = null;

        await Swal.fire({
          icon: 'success',
          title: 'Tour finalizado',
          text: 'La reserva fue marcada como finalizada.',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error finalizando tour:', err);
        this.accionandoId = null;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo finalizar',
          text:
            err?.error?.message ||
            'Ocurrió un error al finalizar la experiencia.'
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

  private actualizarEstadoLocal(
    reservaId: number,
    estado: EstadoReserva
  ): void {
    this.reservas = this.reservas.map((reserva) =>
      reserva.id === reservaId ? { ...reserva, estado } : reserva
    );
  }

  private obtenerFecha(fecha?: string): number {
    if (!fecha) {
      return 0;
    }

    const timestamp = new Date(fecha).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
