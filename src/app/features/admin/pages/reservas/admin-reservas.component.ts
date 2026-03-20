import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, GuiaSimple } from '../../../../core/services/admin.service';
import { ReservaResponse } from '../../../../core/services/reserva.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reservas.component.html',
  styleUrls: ['./admin-reservas.component.css']
})
export class AdminReservasComponent implements OnInit {
  loading = true;
  error = '';
  actionMsg = '';

  reservas: ReservaResponse[] = [];
  guias: GuiaSimple[] = [];

  filtro = '';
  estado = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.loading = true;
    this.error = '';
    this.actionMsg = '';

    this.adminService.listarGuias().subscribe({
      next: (guias) => {
        this.guias = guias ?? [];
      },
      error: (err) => {
        console.error(err);
      }
    });

    this.adminService.listarReservas(this.estado || undefined).subscribe({
      next: (reservas) => {
        this.reservas = reservas ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudieron cargar las reservas';
        this.loading = false;
      }
    });
  }

  get reservasFiltradas(): ReservaResponse[] {
    const term = this.filtro.trim().toLowerCase();

    if (!term) return this.reservas;

    return this.reservas.filter(r =>
      (r.tourNombre ?? '').toLowerCase().includes(term) ||
      (r.nombreCliente ?? '').toLowerCase().includes(term) ||
      (r.emailCliente ?? '').toLowerCase().includes(term) ||
      (r.estado ?? '').toLowerCase().includes(term) ||
      (r.guiaNombre ?? '').toLowerCase().includes(term)
    );
  }

  asignar(reservaId: number, guiaIdRaw: string): void {
    const guiaId = Number(guiaIdRaw);
    if (!guiaId) return;

    this.actionMsg = '';
    this.error = '';

    this.adminService.asignarGuia(reservaId, guiaId).subscribe({
      next: () => {
        this.actionMsg = 'Guía asignado ✅';
        this.cargarTodo();
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudo asignar el guía';
      }
    });
  }

  estadoClase(estado?: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'chip pendiente';
      case 'PAGADA':
        return 'chip pagada';
      case 'EN_CURSO':
        return 'chip curso';
      case 'FINALIZADA':
        return 'chip finalizada';
      case 'CANCELADA':
        return 'chip cancelada';
      case 'FALLIDA':
        return 'chip fallida';
      default:
        return 'chip';
    }
  }

  puedeAsignar(reserva: ReservaResponse): boolean {
    return reserva.estado === 'PAGADA';
  }

  trackByReserva(index: number, item: ReservaResponse): number {
    return item.id;
  }
}
