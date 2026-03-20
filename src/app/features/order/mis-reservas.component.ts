import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservaService, ReservaResponse } from '../../core/services/reserva.service';

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

  cancelar(r: ReservaResponse) {
    const ok = confirm(`¿Cancelar reserva #${r.id}?`);
    if (!ok) return;

    this.reservaService.cancelar(r.id).subscribe({
      next: () => this.cargar(),
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudo cancelar';
      }
    });
  }

  eliminar(r: ReservaResponse) {
    const ok = confirm(`¿Eliminar reserva #${r.id}?`);
    if (!ok) return;

    this.reservaService.eliminar(r.id).subscribe({
      next: () => this.cargar(),
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudo eliminar';
      }
    });
  }

  puedeCancelar(r: ReservaResponse): boolean {
    return r.estado === 'PENDIENTE';
  }

  puedeEliminar(r: ReservaResponse): boolean {
    return ['PENDIENTE', 'CANCELADA', 'FALLIDA'].includes(r.estado);
  }

  estadoClase(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'chip pendiente';
      case 'PAGADA': return 'chip pagada';
      case 'EN_CURSO': return 'chip curso';
      case 'FINALIZADA': return 'chip finalizada';
      case 'CANCELADA': return 'chip cancelada';
      case 'FALLIDA': return 'chip fallida';
      default: return 'chip';
    }
  }
}
