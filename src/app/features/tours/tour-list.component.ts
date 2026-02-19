import { Component, OnInit } from "@angular/core";
import { Tour } from "../../core/models/tour.model";
import { TourService } from "../../core/services/tour.service";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [CommonModule,RouterLink],
  selector: "app-tour-list",
  templateUrl: "./tour-list.component.html",
  styleUrls: ["./tour-list.component.css"]
})
export class TourListComponent implements OnInit {
  tours: Tour[] = [];
  loading = true;
  error = '';

  constructor(private service: TourService) {}

  ngOnInit(): void {
    this.service.listar().subscribe({
      next: (r: Tour[]) => {
        console.log('TOURS >>>', r);
        this.tours = r;
        this.loading = false;
      },
      error: (err) => {
        console.error('TOURS ERROR >>>', err);
        this.error = err?.error?.message || 'No se pudieron cargar los tours';
        this.loading = false;
      }
    });
  }
}
