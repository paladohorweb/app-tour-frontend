import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
  <nav class="nav">
    <a routerLink="/tours">Tours</a>
      <a routerLink="/mapa">Mapa</a>
       <a routerLink="/admin">Admin</a>
<a routerLink="/admin/tours">Admin Tours</a>
<a routerLink="/admin/crear">Crear Tour</a>
    <div class="actions">
      <a routerLink="/login">Login</a>
      <a routerLink="/register">Registro</a>
    </div>
  </nav>
  `,
  styles: [`
    .nav {
      display:flex;
      justify-content:space-between;
      padding:1rem;
      background:#111;
      color:#fff;
    }
    a { color:#fff; margin-right:1rem; text-decoration:none; }
  `]
})
export class NavbarComponent {}
