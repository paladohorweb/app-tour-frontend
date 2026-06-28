import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { RouterLink } from '@angular/router';
import { TourService } from '../../core/services/tour.service';
import { Tour } from '../../core/models/tour.model';

@Component({
  standalone: true,
  selector: 'app-map',
  imports: [CommonModule, RouterLink],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers = new Map<number, L.Marker>();

  tours: Tour[] = [];
  selectedTour?: Tour;

  constructor(private tourService: TourService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      this.loadTours();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  private initMap(): void {
    this.map = L.map('map', {
      zoomControl: false
    }).setView([4.5709, -74.2973], 6);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);
  }

  private loadTours(): void {
    this.tourService.listar().subscribe({
      next: (res) => {
        this.tours = (res ?? []).filter(t => t.latitud && t.longitud);

        const bounds = L.latLngBounds([]);

        this.tours.forEach(tour => {
          const latlng: L.LatLngExpression = [tour.latitud!, tour.longitud!];
          bounds.extend(latlng);

          const marker = L.marker(latlng, {
            icon: this.createMarkerIcon(false)
          }).addTo(this.map);

          marker.bindPopup(this.createPopup(tour));

          marker.on('click', () => {
            this.selectTour(tour);
          });

          this.markers.set(tour.id, marker);
        });

        if (this.tours.length) {
          this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
        }

        setTimeout(() => this.map.invalidateSize(), 200);
      },
      error: (err) => console.error('MAP ERROR', err)
    });
  }

  selectTour(tour: Tour): void {
    this.selectedTour = tour;

    this.markers.forEach((marker, id) => {
      marker.setIcon(this.createMarkerIcon(id === tour.id));
    });

    const marker = this.markers.get(tour.id);

    if (marker && tour.latitud && tour.longitud) {
      this.map.flyTo([tour.latitud, tour.longitud], 13, {
        duration: 0.9
      });

      setTimeout(() => marker.openPopup(), 450);
    }
  }

  centerColombia(): void {
    this.map.flyTo([4.5709, -74.2973], 6, { duration: 0.8 });
  }

  private createMarkerIcon(active: boolean): L.DivIcon {
    return L.divIcon({
      className: active ? 'tour-marker active' : 'tour-marker',
      html: `
        <div class="marker-shell">
          <div class="marker-dot">
            <span>🧭</span>
          </div>
          <div class="marker-pulse"></div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 42],
      popupAnchor: [0, -38]
    });
  }

  private createPopup(tour: Tour): string {
    return `
      <div class="tour-popup">
        <img src="${tour.imagenUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop'}" />
        <div class="tour-popup-body">
          <strong>${tour.nombre}</strong>
          <p>${tour.ciudad}, ${tour.pais}</p>
          <span>$ ${Number(tour.precio).toLocaleString('es-CO')}</span>
        </div>
      </div>
    `;
  }
}
