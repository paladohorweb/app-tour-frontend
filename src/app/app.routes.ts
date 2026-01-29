import { Routes } from '@angular/router';
import { authGuard } from './core/guards/aut.guard';
import { CheckoutComponent } from './features/payments/checkout.component';
import { TourListComponent } from './features/tours/tour-list.component';
import { CancelComponent } from './features/payments/cancel.component';
import { SuccessComponent } from './features/payments/success.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { TourDetailComponent } from './features/tours/tour-detail.component';

export const routes: Routes = [
  { path: '', component: TourListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tours/:id', component: TourDetailComponent },
  { path: 'payment-success', component: SuccessComponent },
{ path: 'payment-cancel', component: CancelComponent },
  {
    path: 'checkout/:id',
    component: CheckoutComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' },
  {
  path: 'admin',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/admin/pages/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent)
}
];

