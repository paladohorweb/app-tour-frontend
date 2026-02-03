import { Component, OnInit } from "@angular/core";
import { Tour } from "../../core/models/tour.model";
import { TourService } from "../../core/services/tour.service";
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "app-tour-list",
  template: `
  <h2>Tours</h2>
  <div *ngFor="let t of tours">
    {{ t.nombre }} - {{ t.precio }}
  </div>
  `
})
export class TourListComponent implements OnInit {

  tours: Tour[] = [];

  constructor(private service: TourService) {}

  ngOnInit(): void {
    this.service.listar().subscribe((r: Tour[]) => {
      this.tours = r;
    });
  }
}
