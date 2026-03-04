import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { TourService } from '../../core/services/tour.service';

@Component({
  standalone: true,
  selector: 'app-map',
  imports: [CommonModule],
  template: `
    <div class="map-wrap">
      <div id="map"></div>
      <button class="refresh" (click)="reload()">Actualizar</button>
    </div>
  `,
  styles: [`
    .map-wrap { position: relative; height: calc(100vh - 0px); }
    #map { height: 100%; width: 100%; }
    .refresh{
      position:absolute; right:16px; top:16px;
      padding:10px 12px; border-radius:12px; border:0;
      background:#111; color:#fff; cursor:pointer;
      box-shadow:0 8px 20px rgba(0,0,0,.18);
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private sub?: Subscription;

  constructor(private tourService: TourService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.reload();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('map', { zoomControl: true }).setView([4.5709, -74.2973], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    // ✅ FIX clásico en SPA: el mapa a veces se ve “gris” o cortado
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  reload(): void {
    this.sub?.unsubscribe();

    // Limpia marcadores anteriores
    this.markersLayer.clearLayers();

    this.sub = this.tourService.listar().subscribe({
      next: (tours) => {
        const bounds: L.LatLngBounds[] = [];

        for (const tour of tours) {
          // ✅ No uses "if (lat && lng)" -> 0 rompe
          if (tour.latitud == null || tour.longitud == null) continue;

          const lat = Number(tour.latitud);
          const lng = Number(tour.longitud);

          if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

          const marker = L.marker([lat, lng]).bindPopup(`
            <strong>${tour.nombre ?? ''}</strong><br/>
            ${tour.ciudad ?? ''}${tour.pais ? ', ' + tour.pais : ''}<br/>
            💲 ${tour.precio ?? ''}
          `);

          marker.addTo(this.markersLayer);
          bounds.push(L.latLngBounds([ [lat, lng], [lat, lng] ]));
        }

        // ✅ Si hay marcadores, encuadra el mapa para verlos todos
        if (this.markersLayer.getLayers().length > 0) {
          const group = L.featureGroup(this.markersLayer.getLayers() as any);
          this.map.fitBounds(group.getBounds().pad(0.2));
        } else {
          // si no hay marcadores, vuelve a Colombia
          this.map.setView([4.5709, -74.2973], 6);
        }
      },
      error: (err) => {
        console.error('Error cargando tours mapa', err);
      }
    });
  }
}
