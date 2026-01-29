import { Routes } from "@angular/router";
import { AdminDashboardComponent } from "./pages/admin-dashboard.component";

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'tours', component: AdminToursComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
