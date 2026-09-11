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
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  items: Notice[] = [];
  marketing = false;
  error = '';
  message = '';
  sending = false;
  input = {
    userId: null as number | null,
    title: '',
    message: '',
    promotional: false,
  };
  privacy = { kind: 'ACCESS', detail: '' };
  requests: any[] = [];
  constructor(
    private api: V2Api,
    public auth: AuthService,
  ) {}
  ngOnInit() {
    this.load();
  }
  load() {
    this.api
      .get<Notice[]>('/notifications')
      .subscribe({
        next: (r) => (this.items = r),
        error: () =>
          (this.error = 'Inicia sesión para ver tus notificaciones.'),
      });
    this.api
      .get<{ marketing: boolean }>('/preferences')
      .subscribe({
        next: (r) => (this.marketing = r.marketing),
        error: () => {},
      });
    this.api
      .get<any[]>(
        this.auth.isAdmin() ? '/admin/privacy-requests' : '/privacy-requests',
      )
      .subscribe({ next: (r) => (this.requests = r), error: () => {} });
  }
  read(n: Notice) {
    this.api
      .patch('/notifications/' + n.id + '/read')
      .subscribe({
        next: () => (n.seen = true),
        error: () => (this.error = 'No se pudo marcar como leída.'),
      });
  }
  save() {
    this.api
      .put('/preferences', { marketing: this.marketing })
      .subscribe({
        next: () => (this.message = 'Preferencia guardada.'),
        error: () => (this.error = 'No se pudo guardar.'),
      });
  }
  send() {
    this.sending = true;
    this.api
      .post<{ sent: number }>('/admin/notifications', this.input)
      .subscribe({
        next: (r) => {
          this.message =
            r.sent + ' notificaciones entregadas en la aplicación.';
          this.sending = false;
          this.load();
        },
        error: (e) => {
          this.error = e.error?.message || 'No se pudo enviar.';
          this.sending = false;
        },
      });
  }
  request() {
    this.api.post('/privacy-requests', this.privacy).subscribe({
      next: () => {
        this.message = 'Solicitud de datos registrada.';
        this.privacy.detail = '';
        this.load();
      },
      error: () => (this.error = 'No se pudo registrar.'),
    });
  }
  close(id: number) {
    this.api
      .patch('/admin/privacy-requests/' + id + '/close')
      .subscribe({
        next: () => this.load(),
        error: () => (this.error = 'No se pudo cerrar.'),
      });
  }
}
