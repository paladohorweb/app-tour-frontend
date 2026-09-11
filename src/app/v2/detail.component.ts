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
  templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {
  e?: Experience;
  slots: Slot[] = [];
  slotId = 0;
  people = 1;
  endDate = '';
  terms = false;
  privacy = false;
  error = '';
  busy = false;
  booking?: Booking;
  requestKey = crypto.randomUUID();
  demo = environment.demo;
  constructor(
    private api: V2Api,
    private route: ActivatedRoute,
    public auth: AuthService,
    private router: Router,
  ) {}
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.get<Experience>('/experiences/' + id).subscribe({
      next: (e) => {
        this.e = e;
        this.api
          .get<Slot[]>('/experiences/' + id + '/slots')
          .subscribe({
            next: (s) => (this.slots = s),
            error: () => (this.error = 'No se pudo cargar la disponibilidad.'),
          });
      },
      error: () => (this.error = 'Experiencia no disponible.'),
    });
  }
  get directions() {
    return this.e
      ? navigationUrl(this.e.meetingLatitude, this.e.meetingLongitude)
      : '';
  }
  get selected() {
    return this.slots.find((s) => s.id === Number(this.slotId));
  }
  get nights() {
    return this.e?.kind === 'STAY' && this.selected
      ? Math.max(
          0,
          (Date.parse(this.endDate) - Date.parse(this.selected.date)) /
            86400000,
        )
      : 1;
  }
  get total() {
    return (this.e?.price || 0) * this.people * this.nights;
  }
  dateChanged() {
    if (this.selected) {
      const d = new Date(this.selected.date + 'T12:00:00');
      d.setDate(d.getDate() + 1);
      this.endDate = d.toISOString().slice(0, 10);
    }
  }
  reserve() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/experiencias/' + this.e?.id },
      });
      return;
    }
    if (
      !this.slotId ||
      !this.terms ||
      !this.privacy ||
      this.people < 1 ||
      this.people > 30
    ) {
      this.error = 'Selecciona fecha, participantes y acepta las políticas.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.api
      .post<Booking>('/bookings', {
        slotId: Number(this.slotId),
        people: this.people,
        endDate: this.e?.kind === 'STAY' ? this.endDate : null,
        requestKey: this.requestKey,
        acceptedTerms: this.terms,
        acceptedPrivacy: this.privacy,
        legalVersion: environment.legalVersion,
      })
      .subscribe({
        next: (b) => {
          this.booking = b;
          this.busy = false;
        },
        error: (e) => {
          this.error = e.error?.message || 'No se pudo registrar la solicitud.';
          this.busy = false;
        },
      });
  }
  get whatsapp() {
    return this.e && this.booking
      ? whatsappUrl(
          this.e.whatsapp,
          `Hola, quiero coordinar la solicitud ${this.booking.reference}: ${this.e.title}, ${this.booking.date}, ${this.booking.people} personas, total consultado COP ${this.booking.total}. ¿Me confirmas disponibilidad y condiciones?`,
        )
      : '';
  }
}
