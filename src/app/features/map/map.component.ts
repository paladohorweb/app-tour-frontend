import { Component, OnInit } from "@angular/core";
import { TourService } from "../../core/services/tour.service";

@Component({
  standalone: true,
  selector: 'app-map',
  template: `<div id="map" style="height:500px"></div>`
})
export class MapComponent implements OnInit {

  constructor(private tourService: TourService) {}

  ngOnInit() {
    const map = L.map('map').setView([6.24, -75.57], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(map);

    this.tourService.getAll().subscribe(tours => {
      tours.forEach(t => {
        if (t.latitud && t.longitud) {
          L.marker([t.latitud, t.longitud])
            .addTo(map)
            .bindPopup(`<b>${t.nombre}</b><br>${t.ciudad}`);
        }
      });
    });
  }
}

