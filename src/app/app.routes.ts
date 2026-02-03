import { Routes } from "@angular/router";
import { LoginComponent } from "./features/auth/login.component";
import { TourListComponent } from "./features/tours/tour-list.component";
import { AdminComponent } from "./features/admin/admin.component";
import { authGuard } from "./core/guards/aut.guard";
import { RegisterComponent } from "./features/auth/register.component";
import { adminGuard } from "./core/guards/role.guard";

export const routes: Routes = [

  { path: '', redirectTo: 'tours', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'tours', component: TourListComponent },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard]
  },

  {
    path: 'mapa',
    loadComponent: () =>
      import('./features/map/map.component')
        .then(m => m.MapComponent)
  },

  {
    path: 'pago/:reservaId',
    loadComponent: () =>
      import('./features/pago/pago.component')
        .then(m => m.PagoComponent)
  },

  {
    path: 'checkout/:tourId',
    loadComponent: () =>
      import('./features/payments/checkout.component')
        .then(m => m.CheckoutComponent)
  },

  {
    path: 'order/success',
    loadComponent: () =>
      import('./features/order/success.component')
        .then(m => m.SuccessComponent)
  },

  // 🚨 SIEMPRE AL FINAL
  { path: '**', redirectTo: 'tours' }
];



