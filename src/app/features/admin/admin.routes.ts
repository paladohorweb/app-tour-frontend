import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';
import { AdminToursComponent } from './pages/tours/admin-tours.component';

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
  },
     {
    path: 'tours',
    component: AdminToursComponent,
    canActivate: [adminGuard]
  }
];
