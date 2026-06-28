import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'tours',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/tours/admin-tours.component').then(m => m.AdminToursComponent)
  },
  {
    path: 'crear',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/create-tour.component').then(m => m.CreateTourComponent)
  },
  {
    path: 'reservas',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/reservas/admin-reservas.component').then(m => m.AdminReservasComponent)
  }
];
