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
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit {
  items: Experience[] = [];
  q = '';
  kind = '';
  sort = '';
  maxPrice: number | null = null;
  get destinations() {
    return [...new Set(this.items.map(e => e.municipality))].sort();
  }
  reset() { this.q = ''; this.kind = ''; this.maxPrice = null; this.sort = ''; }
  loading = true;
  error = '';
  demo = environment.demo;
  demoMessage = environment.demoMessage;
  constructor(private api: V2Api) {}
  ngOnInit() {
    this.load();
  }
  load() {
    this.loading = true;
    this.error = '';
    this.api.get<Experience[]>('/experiences').subscribe({
      next: (r) => {
        this.items = r;
        this.loading = false;
      },
      error: () => {
        this.error = 'No pudimos cargar las experiencias. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }
  get filtered() {
    const q = this.q
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const results = this.items.filter(
      (e) =>
        (!this.kind || e.kind === this.kind) &&
        (this.maxPrice === null || e.price <= this.maxPrice) &&
        [e.title, e.department, e.municipality]
          .join(' ')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .includes(q),
    );
    return this.sort ? results.sort((a, b) => this.sort === 'price' ? a.price - b.price : b.price - a.price) : results;
  }
  label(k: string) {
    return k === 'STAY' ? 'Hospedaje' : k === 'EVENT' ? 'Evento' : 'Tour';
  }
}
