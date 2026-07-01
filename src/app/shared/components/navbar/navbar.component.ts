import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterModule
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;
  userMenuOpen = false;

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.closeAllMenus());
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.userMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  closeAllMenus(): void {
    this.closeMenu();
    this.closeUserMenu();
  }

  logout(): void {
    this.auth.logout();
    this.closeAllMenus();
    this.router.navigate(['/']);
  }

  get userDisplayName(): string {
    return (
      this.auth.currentUser?.nombre ||
      this.auth.currentUser?.email ||
      'Usuario'
    );
  }

  get userEmail(): string {
    return this.auth.currentUser?.email || '';
  }

  get userRoleLabel(): string {
    switch (this.auth.getUserRole()) {
      case 'ADMIN':
        return 'Administrador';

      case 'GUIA':
        return 'Guía turístico';

      case 'USER':
        return 'Viajero';

      default:
        return 'Usuario';
    }
  }

  get userInitial(): string {
    const source =
      this.auth.currentUser?.nombre ||
      this.auth.currentUser?.email ||
      'U';

    return source.charAt(0).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const clickedInsideDropdown = Boolean(
      target.closest('.user-dropdown')
    );

    const clickedUserToggle = Boolean(
      target.closest('.user-toggle')
    );

    if (!clickedInsideDropdown && !clickedUserToggle) {
      this.closeUserMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllMenus();
  }
}
