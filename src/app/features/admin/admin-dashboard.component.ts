import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Tour } from "../../core/models/tour";
import { TourService } from "../../core/services/tour.service";

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <h2>Admin - Tours</h2>

  <button (click)="nuevo()">Nuevo Tour</button>

  <ul>
    <li *ngFor="let t of tours">
      {{ t.nombre }}
      <button (click)="eliminar(t.id!)">Eliminar</button>
    </li>
  </ul>
  `
})
export class AdminDashboardComponent {

  tours: Tour[] = [];

  constructor(private service: TourService) {}

  ngOnInit() {
    this.service.getAll().subscribe(r => this.tours = r);
  }

  nuevo() {
    // TODO: Implement new tour creation logic
  }

  eliminar(id: number) {
    this.service.delete(id).subscribe(() =>
      this.tours = this.tours.filter(t => t.id !== id)
    );
  }
}
