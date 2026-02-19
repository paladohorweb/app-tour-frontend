import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, switchMap, timer } from 'rxjs';
import { ReservaService, ReservaResponse } from '../../core/services/reserva.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit, OnDestroy {

  reservaId?: number;

  loading = true;
  error = '';
  reserva?: ReservaResponse;

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.reservaId = Number(this.route.snapshot.queryParamMap.get('reservaId'));

    if (!this.reservaId) {
      this.loading = false;
      this.error = 'No se encontró reservaId en la URL.';
      return;
    }

    // Polling: cada 2s por 20s máximo (10 intentos)
    this.sub = timer(0, 2000).pipe(
      switchMap(() => this.reservaService.obtenerReserva(this.reservaId!))
    ).subscribe({
      next: (res) => {
        this.reserva = res;
        this.loading = false;

        // si ya llegó a estado final, detenemos polling
        if (res.estado === 'PAGADA' || res.estado === 'FALLIDA' || res.estado === 'CANCELADA') {
          this.sub?.unsubscribe();
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = err?.error?.message || 'No se pudo consultar la reserva.';
      }
    });

    // detener polling a los 20s aunque siga pendiente
    setTimeout(() => this.sub?.unsubscribe(), 20000);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get badgeClass(): string {
    const e = this.reserva?.estado;
    if (e === 'PAGADA') return 'ok';
    if (e === 'PENDIENTE') return 'warn';
    if (e === 'FALLIDA') return 'err';
    if (e === 'CANCELADA') return 'muted';
    return 'muted';
  }
}

