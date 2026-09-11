import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { V2Api } from './api.service';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  consent = false;
  subscribed = false;
  ready = false;
  busy = false;
  message = '';
  error = '';
  demo = environment.demo;
  constructor(public auth: AuthService, private api: V2Api) {}
  ngOnInit() { if (this.auth.isAuthenticated()) this.load(); }
  load() {
    this.error = '';
    this.api.get<{marketing: boolean}>('/preferences').subscribe({
      next: r => { this.subscribed = r.marketing; this.ready = true; },
      error: () => { this.error = 'No pudimos consultar tu suscripción.'; },
    });
  }
  save(marketing: boolean) {
    if (!this.ready || this.busy || (marketing && !this.consent)) return;
    this.busy = true; this.message = ''; this.error = '';
    this.api.put('/preferences', {marketing}).subscribe({
      next: () => {
        this.subscribed = marketing; this.busy = false; this.consent = false;
        this.message = marketing ? 'Te suscribiste a las novedades en la aplicación.' : 'Suscripción cancelada. Ya no recibirás promociones.';
      },
      error: () => { this.busy = false; this.error = 'No se pudo guardar. Intenta nuevamente.'; },
    });
  }
}
