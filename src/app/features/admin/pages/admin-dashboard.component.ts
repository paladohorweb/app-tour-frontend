import { Component, OnInit } from "@angular/core";

@Component({
  standalone: true,
  template: `
    <h1>Panel de Administración</h1>

    <div class="stats">
      <div>Total Tours: {{ stats.tours }}</div>
      <div>Total Ventas: {{ stats.orders }}</div>
      <div>Total Ingresos: ${{ stats.total }}</div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {

  stats = { tours: 0, orders: 0, total: 0 };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.stats().subscribe((res: { tours: number; orders: number; total: number; }) => this.stats = res);
  }
}
