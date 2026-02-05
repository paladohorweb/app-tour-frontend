import { Component } from "@angular/core";
import { TourService } from "../../core/services/tour.service";

@Component({
  standalone: true,
  template: `
  <h2>Admin - Crear Tour</h2>
  <button >Crear</button>
  `
})
export class AdminComponent {

  constructor(private service: TourService) {}


  }
