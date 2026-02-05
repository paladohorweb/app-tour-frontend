import { Routes } from "@angular/router";
import { LoginComponent } from "./features/auth/login.component";
import { RegisterComponent } from "./features/auth/register.component";
import { TourListComponent } from "./features/tours/tour-list.component";


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
    path: 'pago/:reservaId',
    loadComponent: () =>
      import('./features/pago/pago.component').then(m => m.PagoComponent)
  },

  {
    path: 'checkout/:tourId',
    loadComponent: () =>
      import('./features/payments/checkout.component').then(m => m.CheckoutComponent)
  },

  {
    path: 'order/success',
    loadComponent: () =>
      import('./features/order/success.component').then(m => m.SuccessComponent)
  },

  { path: '**', redirectTo: 'tours' }
];
