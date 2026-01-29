import { Component, OnInit } from "@angular/core";
import { Tour } from "../../../core/models/tour";
import { TourService } from "../../../core/services/tour.service";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
  standalone: true,
  imports:[CommonModule,RouterModule,FormsModule],
  template:

  `
  styleUrls: [    <h2>Gestión de Tours</h2>

    <button (click)="openNew()">➕ Nuevo Tour</button>

    <div *ngFor="let tour of tours">
      {{ tour.nombre }} - ${{ tour.precio }}
      <button (click)="delete(tour.id)">🗑</button>
    </div>]
})
export class AdminToursComponent implements OnInit {

  tours: Tour[] = [];

  constructor(private service: TourService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getAll().subscribe(r => this.tours = r);
  }

  delete(id: number) {
    this.service.delete(id).subscribe(() => this.load());
  }
}
