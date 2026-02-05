import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../../../../core/services/tour.service';


@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-tours.component.html'
})
export class AdminToursComponent implements OnInit {

  tours: any[] = [];
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
