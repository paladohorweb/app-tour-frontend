import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { V2Api } from './api.service';
import { environment } from '../../environments/environment';
import { Experience } from './models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css', './landing-future.css'],
})
export class LandingComponent implements OnInit {
  consent = false;
  subscribed = false;
  ready = false;
  busy = false;
  message = '';
  error = '';
  demo = environment.demo;
  category = '';
  loadingExperiences = true;
  catalogError = '';
  experiences: Experience[] = [];
  examples = [
    {id: 0, title:'Café y caminos de Jardín', municipality:'Jardín', kind:'TOUR', price:85000, imageUrl:'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80'},
    {id: 0, title:'Una cabaña entre montañas', municipality:'Salento', kind:'STAY', price:145000, imageUrl:'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80'},
    {id: 0, title:'Sabores y música al atardecer', municipality:'Villa de Leyva', kind:'EVENT', price:65000, imageUrl:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'},
  ];
  get preview() { return !this.loadingExperiences && !this.catalogError && !this.experiences.length; }
  get cards() { return (this.preview ? this.examples : this.experiences).filter(e => !this.category || e.kind === this.category).slice(0,6); }
  label(kind: string) { return kind === 'STAY' ? 'Hospedaje' : kind === 'EVENT' ? 'Evento' : 'Tour'; }
  loadExperiences() {
    this.loadingExperiences = true; this.catalogError = '';
    this.api.get<Experience[]>('/experiences').subscribe({
      next: items => { this.experiences = items; this.loadingExperiences = false; },
      error: () => { this.catalogError = 'No pudimos cargar los planes. Intenta nuevamente.'; this.loadingExperiences = false; },
    });
  }
  constructor(public auth: AuthService, private api: V2Api) {}
  ngOnInit() { this.loadExperiences(); if (this.auth.isAuthenticated()) this.load(); }
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
