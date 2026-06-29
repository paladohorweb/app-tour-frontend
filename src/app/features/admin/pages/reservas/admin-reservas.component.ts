import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

import {
  AdminService,
  GuiaSimple
} from '../../../../core/services/admin.service';
import {
  EstadoReserva,
  ReservaResponse
} from '../../../../core/services/reserva.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reservas.component.html',
  styleUrls: ['./admin-reservas.component.css']
})
export class AdminReservasComponent implements OnInit {
  loading = true;
  error = '';
  errorGuias = '';

  reservas: ReservaResponse[] = [];
  guias: GuiaSimple[] = [];

  filtro = '';
  estado: EstadoReserva | '' = '';
  asignandoId: number | null = null;

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.loading = true;
    this.error = '';
    this.errorGuias = '';

    forkJoin({
      reservas: this.adminService.listarReservas(this.estado || undefined),

      guias: this.adminService.listarGuias().pipe(
        catchError((err) => {
          console.error('Error cargando guías:', err);
          this.errorGuias = 'No fue posible cargar los guías disponibles.';
          return of([] as GuiaSimple[]);
        })
      )
    }).subscribe({
      next: ({ reservas, guias }) => {
        this.reservas = reservas ?? [];
        this.guias = guias ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
        this.error =
          err?.error?.message || 'No se pudieron cargar las reservas.';
        this.loading = false;
      }
    });
  }

  get reservasFiltradas(): ReservaResponse[] {
    const termino = this.filtro.trim().toLowerCase();

    if (!termino) {
      return this.reservas;
    }

    return this.reservas.filter((reserva) =>
      [
        reserva.tourNombre,
        reserva.nombreCliente,
        reserva.emailCliente,
        reserva.estado,
        reserva.guiaNombre,
        reserva.metodoPago
      ]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termino))
    );
  }

  get totalReservas(): number {
    return this.reservas.length;
  }

  get pendientes(): number {
    return this.contarEstado('PENDIENTE');
  }

  get pagadas(): number {
    return this.contarEstado('PAGADA');
  }

  get sinGuia(): number {
    return this.reservas.filter(
      (reserva) => reserva.estado === 'PAGADA' && !reserva.guiaId
    ).length;
  }

  get finalizadas(): number {
    return this.contarEstado('FINALIZADA');
  }

  async asignar(
    reserva: ReservaResponse,
    guiaIdRaw: string
  ): Promise<void> {
    const guiaId = Number(guiaIdRaw);

    if (!guiaId) {
      await Swal.fire({
        icon: 'info',
        title: 'Selecciona un guía',
        text: 'Debes seleccionar un guía antes de asignarlo.'
      });

      return;
    }

    if (!this.puedeAsignar(reserva)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Reserva no disponible',
        text: 'Solo las reservas pagadas pueden recibir una asignación de guía.'
      });

      return;
    }

    const guia = this.guias.find((item) => item.id === guiaId);

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: '¿Asignar guía?',
      html: `
        <p>Reserva <strong>#${reserva.id}</strong></p>
        <p>Tour: <strong>${this.escapeHtml(reserva.tourNombre)}</strong></p>
        <p>Guía: <strong>${this.escapeHtml(guia?.nombre || 'No encontrado')}</strong></p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0f172a'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.asignandoId = reserva.id;

    this.adminService.asignarGuia(reserva.id, guiaId).subscribe({
      next: async () => {
        this.asignandoId = null;

        await Swal.fire({
          icon: 'success',
          title: 'Guía asignado',
          text: 'La reserva fue actualizada correctamente.',
          timer: 1600,
          showConfirmButton: false
        });

        this.cargarTodo();
      },
      error: async (err) => {
        console.error('Error asignando guía:', err);
        this.asignandoId = null;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo asignar el guía',
          text:
            err?.error?.message ||
            'Ocurrió un error al actualizar la reserva.'
        });
      }
    });
  }

  puedeAsignar(reserva: ReservaResponse): boolean {
    return reserva.estado === 'PAGADA';
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
    }
  }

  trackByReserva(_: number, reserva: ReservaResponse): number {
    return reserva.id;
  }

  esAsignando(reserva: ReservaResponse): boolean {
    return this.asignandoId === reserva.id;
  }

  private contarEstado(estado: EstadoReserva): number {
    return this.reservas.filter(
      (reserva) => reserva.estado === estado
    ).length;
  }

  private escapeHtml(valor: string): string {
    return valor
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
