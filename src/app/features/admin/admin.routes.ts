import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'tours',
        loadComponent: () =>
          import('./pages/tours/admin-tours.component')
            .then(m => m.AdminToursComponent)
      },
      {
        path: 'crear',
        loadComponent: () =>
          import('./pages/create-tour.component')
            .then(m => m.CreateTourComponent)
      }
    ]
  }
];
