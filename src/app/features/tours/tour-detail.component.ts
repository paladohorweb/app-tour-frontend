import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Tour } from "../../core/models/tour.model";
import { TourService } from "../../core/services/tour.service";

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
  <div class="grid">
    <div class="card" *ngFor="let tour of tours">
      <img [src]="tour.imagenUrl">
      <h3>{{ tour.nombre }}</h3>
      <p>{{ tour.ciudad }} - {{ tour.pais }}</p>
      <p><strong>$ {{ tour.precio }}</strong></p>

      <a [routerLink]="['/tours', tour.id]">Ver</a>
      <a [routerLink]="['/checkout', tour.id]">Reservar</a>
    </div>
  </div>
  `
})
export class TourDetailComponent {

  tours: Tour[] = [];

  constructor(private service: TourService) {}

  ngOnInit() {
    this.service.listar().subscribe(res => this.tours = res);
  }
}
