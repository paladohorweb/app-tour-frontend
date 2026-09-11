import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { V2Api, navigationUrl, whatsappUrl } from './api.service';
import { Experience, Slot, Booking, Notice, STATUS } from './models';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trips.component.html',
})
export class TripsComponent implements OnInit {
  items: Booking[] = [];
  error = '';
  status = STATUS;
  experiences = new Map<number, Experience>();
  constructor(private api: V2Api) {}
  ngOnInit() {
    this.load();
  }
  load() {
    this.api.get<Booking[]>('/bookings').subscribe({
      next: (r) => {
        this.items = r;
        for (const b of r)
          this.api
            .get<Experience>('/experiences/' + b.experienceId)
            .subscribe({
              next: (e) => this.experiences.set(e.id, e),
              error: () => {},
            });
      },
      error: () => (this.error = 'Inicia sesión para consultar tu viaje.'),
    });
  }
  directions(b: Booking) {
    return Number.isFinite(b.meetingLatitude) &&
      Number.isFinite(b.meetingLongitude)
      ? navigationUrl(b.meetingLatitude, b.meetingLongitude)
      : '';
  }
  cancel(b: Booking) {
    if (
      !confirm(
        '¿Solicitar la cancelación? Si ya pagaste, el reembolso requiere revisión.',
      )
    )
      return;
    this.api
      .patch('/bookings/' + b.id + '/cancel')
      .subscribe({
        next: () => this.load(),
        error: (e) => (this.error = e.error?.message || 'No se pudo cancelar.'),
      });
  }
}
