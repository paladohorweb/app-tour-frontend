import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../../../../core/services/tour.service';
import { Tour } from '../../../../core/models/tour.model';


@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-tours.component.html'
})
export class AdminToursComponent implements OnInit {

  tours: Tour[] = [];
  loading = true;

  constructor(private tourService: TourService) {}

  ngOnInit() {
    this.cargarTours();
  }

  cargarTours() {
    this.tourService.listar().subscribe({
      next: res => {
        this.tours = res;
        this.loading = false;
      }
    });
  }
}
