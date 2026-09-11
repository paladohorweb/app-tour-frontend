import { inject } from '@angular/core';
import { Routes, Router, CanActivateFn } from '@angular/router';
import { AuthService } from './core/services/auth.service';
const signed: CanActivateFn = (_, state) =>
  inject(AuthService).isAuthenticated() ||
  inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
const provider: CanActivateFn = (_, state) => {
  const a = inject(AuthService);
  return (
    (a.isAuthenticated() && (a.isGuia() || a.isAdmin())) ||
    inject(Router).createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    })
  );
};
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./v2/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'tours',
    loadComponent: () =>
      import('./v2/catalog.component').then((m) => m.CatalogComponent),
  },
  {
    path: 'experiencias/:id',
    loadComponent: () =>
      import('./v2/detail.component').then((m) => m.DetailComponent),
  },
  { path: 'tours/:id', redirectTo: 'experiencias/:id' },
  { path: 'checkout/:id', redirectTo: 'experiencias/:id' },
  {
    path: 'mapa',
    loadComponent: () =>
      import('./features/map/map.component').then((m) => m.MapComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'mis-reservas',
    canActivate: [signed],
    loadComponent: () =>
      import('./v2/trips.component').then((m) => m.TripsComponent),
  },
  {
    path: 'guia/panel',
    canActivate: [provider],
    loadComponent: () =>
      import('./v2/provider.component').then((m) => m.ProviderComponent),
  },
  {
    path: 'admin/dashboard',
    canActivate: [provider],
    loadComponent: () =>
      import('./v2/provider.component').then((m) => m.ProviderComponent),
  },
  { path: 'admin/tours', redirectTo: 'admin/dashboard' },
  { path: 'admin/reservas', redirectTo: 'admin/dashboard' },
  {
    path: 'notificaciones',
    canActivate: [signed],
    loadComponent: () =>
      import('./v2/notifications.component').then(
        (m) => m.NotificationsComponent,
      ),
  },
  {
    path: 'legal/:page',
    loadComponent: () =>
      import('./v2/legal.component').then((m) => m.LegalComponent),
  },
  { path: '**', redirectTo: '' },
];
