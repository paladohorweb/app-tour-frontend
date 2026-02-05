import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { TourService } from '../../core/services/tour.service';

@Component({
  standalone: true,
  selector: 'app-map',
  imports: [CommonModule],
  template: `<div id="map" style="height: 100vh"></div>`
})
export class MapComponent implements AfterViewInit {

  private map!: L.Map;

  constructor(private tourService: TourService) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadTours();
  }

  private initMap(): void {
    this.map = L.map('map').setView([4.5709, -74.2973], 6); // Colombia

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);
  }

  private loadTours(): void {
    this.tourService.listar().subscribe(tours => {
      tours.forEach(tour => {
        if (tour.latitud && tour.longitud) {
          L.marker([tour.latitud, tour.longitud])
            .addTo(this.map)
            .bindPopup(`
              <strong>${tour.nombre}</strong><br>
              ${tour.ciudad}, ${tour.pais}<br>
              💲 ${tour.precio}
            `);
        }
      });
    });
  }
}


