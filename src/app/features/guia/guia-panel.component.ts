import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuiaService } from '../../core/services/guia.service';
import { ReservaResponse } from '../../core/services/reserva.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guia-panel.component.html',
  styleUrls: ['./guia-panel.component.css']
})
export class GuiaPanelComponent implements OnInit {
  loading = true;
  error = '';
  actionMsg = '';
  reservas: ReservaResponse[] = [];

  constructor(private guiaService: GuiaService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.error = '';
    this.actionMsg = '';

    this.guiaService.misReservas().subscribe({
      next: (res) => {
        this.reservas = res ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudieron cargar las reservas asignadas';
        this.loading = false;
      }
    });
  }

  iniciar(r: ReservaResponse) {
    this.guiaService.iniciar(r.id).subscribe({
      next: () => {
        this.actionMsg = 'Tour iniciado ✅';
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudo iniciar el tour';
      }
    });
  }

  finalizar(r: ReservaResponse) {
    this.guiaService.finalizar(r.id).subscribe({
      next: () => {
        this.actionMsg = 'Tour finalizado ✅';
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudo finalizar el tour';
      }
    });
  }
}
