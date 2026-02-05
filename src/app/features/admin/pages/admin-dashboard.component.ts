import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../../../core/services/tour.service';
import { Tour } from '../../../core/models/tour.model';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  tours: Tour[] = [];
  loading = true;

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.tourService.listar().subscribe({
      next: data => {
        this.tours = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

    getTotalRevenue(): number {
    return this.tours.reduce((sum, tour) => sum + (tour.precio || 0), 0);
  }
}

