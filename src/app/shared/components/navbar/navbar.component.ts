import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <nav class="nav">
    <div class="left">
      <a routerLink="/tours" class="brand">TurismoApp</a>
      <a routerLink="/tours">Tours</a>
      <a routerLink="/mapa">Mapa</a>

      <a *ngIf="auth.isAuthenticated()" routerLink="/mis-reservas">Mis Reservas</a>
      <a *ngIf="auth.isAdmin()" routerLink="/admin/tours">Admin Tours</a>
      <a *ngIf="auth.isAdmin()" routerLink="/admin/reservas">Admin Reservas</a>
      <a *ngIf="auth.isGuia()" routerLink="/guia/panel">Panel Guía</a>
    </div>

    <div class="right">
      <ng-container *ngIf="!auth.isAuthenticated(); else logged">
        <a routerLink="/login">Login</a>
        <a routerLink="/register" class="pill">Registro</a>
      </ng-container>

      <ng-template #logged>
        <span class="pill">{{ auth.getUserRole() }}</span>
        <span class="email">{{ auth.refreshUserFromToken() }}</span>
        <button class="logout" (click)="logout()">Salir</button>
      </ng-template>
    </div>
  </nav>
  `,
  styles: [`
    .nav{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#111;color:#fff;flex-wrap:wrap;gap:10px}
    .left,.right{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    a{color:#fff;text-decoration:none;opacity:.9}
    a:hover{opacity:1}
    .brand{font-weight:700}
    .pill{border:1px solid rgba(255,255,255,.2);padding:6px 10px;border-radius:999px}
    .logout{background:#fff;color:#111;border:0;border-radius:10px;padding:8px 10px;cursor:pointer}
    .email{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
