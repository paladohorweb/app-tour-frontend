import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent)
  },
  {
    path: 'crear',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/create-tour.component')
        .then(m => m.CreateTourComponent)
  }
];
