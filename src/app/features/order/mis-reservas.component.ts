import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservaService, ReservaResponse } from '../../core/services/reserva.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.css']
})
export class MisReservasComponent implements OnInit {

  loading = true;
  error = '';
  reservas: ReservaResponse[] = [];

  constructor(private reservaService: ReservaService) {}

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
        this.error = err?.error?.message || 'No se pudieron cargar las reservas';
        this.loading = false;
      }
    });
  }

  async cancelar(r: ReservaResponse) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancelar reserva',
      text: `¿Deseas cancelar la reserva #${r.id}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar'
    });

    if (!result.isConfirmed) return;

    this.reservaService.cancelar(r.id).subscribe({
      next: async () => {
        await Swal.fire('Cancelada', 'La reserva fue cancelada', 'success');
        this.cargar();
      },
      error: async (err) => {
        console.error(err);
        await Swal.fire('Error', err?.error?.message || 'No se pudo cancelar', 'error');
      }
    });
  }

  async eliminar(r: ReservaResponse) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar reserva',
      text: `¿Deseas eliminar la reserva #${r.id}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    });

    if (!result.isConfirmed) return;

    this.reservaService.eliminar(r.id).subscribe({
      next: async () => {
        await Swal.fire('Eliminada', 'La reserva fue eliminada', 'success');
        this.cargar();
      },
      error: async (err) => {
        console.error(err);
        await Swal.fire('Error', err?.error?.message || 'No se pudo eliminar', 'error');
      }
    });
  }

  puedeCancelar(r: ReservaResponse): boolean {
    return r.estado === 'PENDIENTE';
  }

  puedeEliminar(r: ReservaResponse): boolean {
    return ['PENDIENTE', 'CANCELADA', 'FALLIDA'].includes(r.estado);
  }

   estadoClase(estado: string | null | undefined): string {
    switch ((estado || '').toUpperCase()) {
      case 'PENDIENTE':
        return 'badge bg-warning text-dark';
      case 'CONFIRMADA':
        return 'badge bg-info text-dark';
      case 'PAGADA':
        return 'badge bg-success';
      case 'CANCELADA':
        return 'badge bg-danger';
      case 'RECHAZADA':
        return 'badge bg-dark';
      default:
        return 'badge bg-secondary';
    }
  }
}
