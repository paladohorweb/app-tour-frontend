import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { V2Api, navigationUrl } from '../../v2/api.service';
import { Experience } from '../../v2/models';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  map?: L.Map;
  layer = L.layerGroup();
  items: Experience[] = [];
  q = '';
  demo = environment.demo;
  kind = '';
  selected?: Experience;
  error = '';
  loading = true;
  locating = false;
  location?: L.CircleMarker;
  accuracy?: L.Circle;
  observer?: ResizeObserver;
  subscription?: Subscription;
  destroyed = false;
  constructor(private api: V2Api, route: ActivatedRoute) {
    this.q = route.snapshot.queryParamMap.get('q') || '';
    this.kind = route.snapshot.queryParamMap.get('kind') || '';
  }
  distance(e: Experience): string {
    if (!this.location) return '';
    return (this.location.getLatLng().distanceTo([e.latitude, e.longitude]) / 1000).toFixed(1);
  }
  ngAfterViewInit() {
    this.map = L.map('map', { zoomControl: false }).setView([4.57, -74.29], 6);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors · HOT',
      maxZoom: 19,
    })
      .on(
        'tileerror',
        () =>
          (this.error =
            'No se pudieron cargar algunas partes del mapa. Revisa tu conexión.'),
      )
      .addTo(this.map);
    this.layer.addTo(this.map);
    this.observer = new ResizeObserver(() => this.map?.invalidateSize());
    this.observer.observe(document.getElementById('map')!);
    this.load();
  }
  load() {
    this.error = '';
    this.loading = true;
    this.subscription?.unsubscribe();
    this.subscription = this.api.get<Experience[]>('/experiences').subscribe({
      next: (r) => {
        this.items = r.filter(
          (e) =>
            Number.isFinite(e.latitude) &&
            Number.isFinite(e.longitude) &&
            Math.abs(e.latitude) <= 90 &&
            Math.abs(e.longitude) <= 180,
        );
        this.loading = false;
        this.redraw(true);
      },
      error: () => {
        this.loading = false;
        this.error = 'No pudimos cargar las experiencias. Puedes reintentar.';
      },
    });
  }
  get filtered() {
    const norm = (v: string) =>
      v
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const result = this.items.filter(
      (e) =>
        (!this.kind || e.kind === this.kind) &&
        norm(e.title + ' ' + e.municipality + ' ' + e.department).includes(
          norm(this.q),
        ),
    );
    if (this.location)
      result.sort(
        (a, b) =>
          this.location!.getLatLng().distanceTo([a.latitude, a.longitude]) -
          this.location!.getLatLng().distanceTo([b.latitude, b.longitude]),
      );
    return result;
  }
  redraw(fit = false) {
    this.layer.clearLayers();
    if (this.selected && !this.filtered.some((e) => e.id === this.selected?.id))
      this.selected = undefined;
    const points: L.LatLngExpression[] = [];
    for (const e of this.filtered) {
      points.push([e.latitude, e.longitude]);
      const content = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = e.title;
      const city = document.createElement('p');
      city.textContent = e.municipality;
      content.append(title, city);
      const badge = document.createElement('span');
      badge.className = 'map-price-label';
      badge.textContent = new Intl.NumberFormat('es-CO', {style:'currency', currency:'COP', maximumFractionDigits:0}).format(e.price);
      badge.style.background = e.kind === 'STAY' ? '#a65a32' : e.kind === 'EVENT' ? '#7c3aed' : '#0f766e';
      L.marker([e.latitude, e.longitude], {
        title: e.title,
        icon: L.divIcon({html: badge, className: 'map-price-icon', iconSize:[88,34], iconAnchor:[44,17]}),
      })
        .bindPopup(content)
        .on('click', () => this.select(e))
        .addTo(this.layer);
    }
    if (fit && points.length)
      this.map?.fitBounds(L.latLngBounds(points), {
        padding: [40, 40],
        maxZoom: 12,
      });
  }
  select(e: Experience) {
    this.selected = e;
    this.map?.flyTo([e.latitude, e.longitude], 14);
  }
  locate() {
    if (!navigator.geolocation) {
      this.error = 'Tu navegador no ofrece ubicación. Busca un municipio.';
      return;
    }
    this.locating = true;
    this.error = '';
    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (this.destroyed) return;
        this.locating = false;
        const ll: L.LatLngExpression = [p.coords.latitude, p.coords.longitude];
        this.location?.remove();
        this.accuracy?.remove();
        this.location = L.circleMarker(ll, {
          radius: 8,
          color: '#fff',
          fillColor: '#2563eb',
          fillOpacity: 1,
        })
          .bindTooltip('Tu ubicación')
          .addTo(this.map!);
        this.accuracy = L.circle(ll, {
          radius: p.coords.accuracy,
          weight: 1,
          fillOpacity: 0.06,
        }).addTo(this.map!);
        this.map?.setView(ll, 13);
        this.redraw(false);
      },
      () => {
        if (this.destroyed) return;
        this.locating = false;
        this.error =
          'No se obtuvo tu ubicación. Revisa el permiso o busca un municipio.';
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }
  directions(e: Experience) {
    return navigationUrl(e.meetingLatitude, e.meetingLongitude);
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.subscription?.unsubscribe();
    this.observer?.disconnect();
    this.map?.remove();
  }
}
