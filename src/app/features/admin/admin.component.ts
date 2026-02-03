import { Component } from "@angular/core";
import { TourService } from "../../core/services/tour.service";

@Component({
  standalone: true,
  template: `
  <h2>Admin - Crear Tour</h2>
  <button (click)="crear()">Crear</button>
  `
})
export class AdminComponent {

  constructor(private service: TourService) {}

  crear() {
    this.service.createTour({
      nombre: 'Tour desde Admin',
      descripcion: 'Tour creado desde el panel de administración',
      ciudad: 'Medellín',
      pais: 'Colombia',
      precio: 100,
      imagenUrl: '',
      latitud: 0,
      longitud: 0
    });
  }}
