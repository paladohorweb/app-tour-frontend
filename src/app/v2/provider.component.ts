import { LocationPickerComponent } from './location-picker.component';
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
  imports: [CommonModule, FormsModule, RouterLink, LocationPickerComponent],
  templateUrl: './provider.component.html',
})
export class ProviderComponent implements OnInit {
  items: Experience[] = [];
  bookings: Booking[] = [];
  error = '';
  message = '';
  busy = false;
  status = STATUS;
  editing = 0;
  selected = 0;
  tab = 'overview';
  bookingFilter = '';
  demo = environment.demo;
  get activeCount() { return this.items.filter(e => e.active).length; }
  get pendingCount() { return this.bookings.filter(b => b.status === 'REQUESTED').length; }
  get verifiedTotal() { return this.bookings.filter(b => b.paymentStatus === 'VERIFIED' && b.status !== 'CANCELLED').reduce((sum,b) => sum + b.total, 0); }
  get filteredBookings() { return this.bookings.filter(b => !this.bookingFilter || b.status === this.bookingFilter); }
  get upcoming() { const today = new Date().toLocaleDateString('en-CA'); return this.bookings.filter(b => b.status === 'CONFIRMED' && b.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0,5); }
  count(kind: string) { return this.items.filter(e => e.kind === kind).length; }
  slot = { date: '', time: '09:00', capacity: 10 };
  form: any = this.empty();
  constructor(private api: V2Api) {}
  empty() {
    return {
      title: '',
      description: '',
      kind: 'TOUR',
      department: '',
      municipality: '',
      address: '',
      latitude: 4.57,
      longitude: -74.29,
      meetingLatitude: 4.57,
      meetingLongitude: -74.29,
      meetingInstructions: '',
      whatsapp: '57',
      imageUrl: '',
      rnt: '',
      cancellationPolicy: '',
      price: 10000,
    };
  }
  ngOnInit() {
    this.load();
  }
  load() {
    this.api
      .get<Experience[]>('/provider/experiences')
      .subscribe({
        next: (r) => (this.items = r),
        error: (e) =>
          (this.error =
            e.error?.message || 'Solo prestadores y administradores.'),
      });
    this.api
      .get<Booking[]>('/provider/bookings')
      .subscribe({ next: (r) => (this.bookings = r), error: () => { this.error = 'No se pudieron cargar las reservas. Los indicadores pueden estar incompletos.'; } });
  }
  edit(e: Experience) {
    this.tab = 'publications';
    this.editing = e.id;
    const { id, ownerId, active, ...rest } = e;
    this.form = rest;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  reset() {
    this.editing = 0;
    this.form = this.empty();
  }
  save() {
    this.busy = true;
    this.error = '';
    const req = this.editing
      ? this.api.put('/provider/experiences/' + this.editing, this.form)
      : this.api.post('/provider/experiences', this.form);
    req.subscribe({
      next: () => {
        this.message = 'Experiencia guardada. Publica sus fechas disponibles.';
        this.busy = false;
        this.reset();
        this.load();
      },
      error: (e) => {
        this.error = e.error?.message || 'Revisa los campos.';
        this.busy = false;
      },
    });
  }
  addSlot() {
    this.api
      .post('/provider/experiences/' + this.selected + '/slots', this.slot)
      .subscribe({
        next: () => (this.message = 'Fecha disponible publicada.'),
        error: (e) => (this.error = e.error?.message || 'No se pudo publicar.'),
      });
  }
  active(e: Experience) {
    this.api
      .patch('/provider/experiences/' + e.id + '/active', { active: !e.active })
      .subscribe({
        next: () => this.load(),
        error: (e) => (this.error = e.error?.message),
      });
  }
  action(b: Booking, act: string) {
    if (
      act === 'verify-payment' &&
      !confirm(
        'Confirma que verificaste la recepción del dinero. Esta acción queda auditada.',
      )
    )
      return;
    this.api
      .patch('/bookings/' + b.id + '/' + act)
      .subscribe({
        next: () => this.load(),
        error: (e) =>
          (this.error = e.error?.message || 'No se pudo actualizar.'),
      });
  }
  useLocation() {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        this.form.latitude = p.coords.latitude;
        this.form.longitude = p.coords.longitude;
        this.form.meetingLatitude = p.coords.latitude;
        this.form.meetingLongitude = p.coords.longitude;
        this.message = 'Ubicación copiada. Revisa el punto de encuentro.';
      },
      () =>
        (this.error =
          'No se pudo obtener tu ubicación. Puedes escribir las coordenadas.'),
    );
  }
}
