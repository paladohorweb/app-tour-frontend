import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <header class="header">
    <nav class="nav">
      <a class="brand" routerLink="/tours">TourApp</a>

      <div class="links">
        <a routerLink="/tours" routerLinkActive="active">Tours</a>
        <a routerLink="/mapa" routerLinkActive="active">Mapa</a>
        <a *ngIf="(auth.user$ | async)?.role === 'ADMIN'"
           routerLink="/admin" routerLinkActive="active">Admin</a>
      </div>

      <div class="right" *ngIf="auth.user$ | async as user; else guest">
        <div class="user">
          <span class="avatar">{{ (user.nombre?.[0] ?? user.email[0]).toUpperCase() }}</span>
          <div class="meta">
            <div class="name">{{ user.nombre || user.email }}</div>
            <div class="role" *ngIf="user.role">{{ user.role }}</div>
          </div>
        </div>

        <button class="btn ghost" (click)="logout()">Cerrar sesión</button>
      </div>

      <ng-template #guest>
        <div class="right">
          <a class="btn ghost" routerLink="/login">Login</a>
          <a class="btn solid" routerLink="/register">Registro</a>
        </div>
      </ng-template>
    </nav>
  </header>
  `,
  styles: [`
    .header { position: sticky; top: 0; z-index: 50; background: #0b1220; border-bottom: 1px solid rgba(255,255,255,.08); }
    .nav { max-width: 1100px; margin: 0 auto; padding: 14px 16px; display:flex; align-items:center; gap: 14px; }
    .brand { color:#fff; font-weight: 700; letter-spacing: .3px; text-decoration:none; }
    .links { display:flex; gap: 10px; flex: 1; }
    .links a { color: rgba(255,255,255,.82); text-decoration:none; padding: 8px 10px; border-radius: 10px; }
    .links a.active, .links a:hover { background: rgba(255,255,255,.08); color: #fff; }
    .right { display:flex; align-items:center; gap: 10px; }
    .btn { border-radius: 12px; padding: 8px 12px; cursor:pointer; border: 1px solid rgba(255,255,255,.18); background: transparent; color:#fff; text-decoration:none; display:inline-flex; align-items:center; }
    .btn.solid { background: #2f66ff; border-color: #2f66ff; }
    .btn.ghost:hover { background: rgba(255,255,255,.08); }
    .user { display:flex; align-items:center; gap:10px; }
    .avatar { width: 32px; height: 32px; border-radius: 999px; background: rgba(255,255,255,.12); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; }
    .meta { line-height: 1.1; }
    .name { color:#fff; font-size: 13px; }
    .role { color: rgba(255,255,255,.65); font-size: 11px; margin-top: 2px; }
    @media (max-width: 720px) { .links { display:none; } }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

