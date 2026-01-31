import { Routes } from "@angular/router";
import { LoginComponent } from "./features/auth/login.component";
import { TourListComponent } from "./features/tours/tour-list.component";
import { AdminComponent } from "./features/admin/admin.component";
import { authGuard } from "./core/guards/aut.guard";
import { RegisterComponent } from "./features/auth/register.component";
import { adminGuard } from "./core/guards/role.guard";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tours', component: TourListComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'tours' },
    {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/pages/admin-dashboard.component')
        .then(c => c.AdminDashboardComponent)
  }

];



