import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TourService } from '../../../../core/services/tour.service';
import { AdminService } from '../../../../core/services/admin.service';
import { Tour } from '../../../../core/models/tour.model';
import { ReservaResponse } from '../../../../core/services/reserva.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  loadingTours = true;
  loadingReservas = true;
  error = '';

  tours: Tour[] = [];
  reservas: ReservaResponse[] = [];

  constructor(
    private tourService: TourService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.cargarTours();
    this.cargarReservas();
  }

  cargarTours(): void {
    this.loadingTours = true;

    this.tourService.listar().subscribe({
      next: (data) => {
        this.tours = data ?? [];
        this.loadingTours = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar los tours';
        this.loadingTours = false;
      }
    });
  }

  cargarReservas(): void {
    this.loadingReservas = true;

    this.adminService.listarReservas().subscribe({
      next: (data) => {
        this.reservas = data ?? [];
        this.loadingReservas = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar las reservas';
        this.loadingReservas = false;
      }
    });
  }

  countEstado(estado: string): number {
    return this.reservas.filter(r => r.estado === estado).length;
  }

  get totalTours(): number {
    return this.tours.length;
  }

  get toursActivos(): number {
    return this.tours.filter(t => t.activo).length;
  }

  get totalReservas(): number {
    return this.reservas.length;
  }

  get pendientes(): number {
    return this.countEstado('PENDIENTE');
  }

  get pagadas(): number {
    return this.countEstado('PAGADA');
  }

  get enCurso(): number {
    return this.countEstado('EN_CURSO');
  }

  get finalizadas(): number {
    return this.countEstado('FINALIZADA');
  }

  get ingresosEstimados(): number {
    return this.reservas
      .filter(r => ['PAGADA', 'EN_CURSO', 'FINALIZADA'].includes(r.estado))
      .reduce((sum, r) => sum + Number(r.monto || 0), 0);
  }

  get reservasRecientes(): ReservaResponse[] {
    return this.reservas.slice(0, 6);
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge rounded-pill text-bg-warning';
      case 'PAGADA': return 'badge rounded-pill text-bg-success';
      case 'EN_CURSO': return 'badge rounded-pill text-bg-primary';
      case 'FINALIZADA': return 'badge rounded-pill text-bg-dark';
      case 'CANCELADA': return 'badge rounded-pill text-bg-secondary';
      case 'FALLIDA': return 'badge rounded-pill text-bg-danger';
      default: return 'badge rounded-pill text-bg-light';
    }
  }

  get loading(): boolean {
    return this.loadingTours || this.loadingReservas;
  }
}
