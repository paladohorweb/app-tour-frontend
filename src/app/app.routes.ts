import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { TourListComponent } from './features/tours/tour-list.component';
import { guiaGuard } from './core/guards/guia.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tours', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'tours', component: TourListComponent },

  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  {
    path: 'mapa',
    loadComponent: () =>
      import('./features/map/map.component').then(m => m.MapComponent)
  },

  {
    path: 'checkout/:tourId',
    loadComponent: () =>
      import('./features/payments/checkout.component').then(m => m.CheckoutComponent)
  },

  {
    path: 'pago/:reservaId',
    loadComponent: () =>
      import('./features/pago/pago.component').then(m => m.PagoComponent)
  },

  {
    path: 'order/success',
    loadComponent: () =>
      import('./features/order/success.component').then(m => m.SuccessComponent)
  },

  {
    path: 'mis-reservas',
    loadComponent: () =>
      import('./features/order/mis-reservas.component').then(m => m.MisReservasComponent)
  },

  {
    path: 'guia/panel',
    canActivate: [guiaGuard],
    loadComponent: () =>
      import('./features/guia/guia-panel.component').then(m => m.GuiaPanelComponent)
  },

  { path: '**', redirectTo: 'tours' }
];
