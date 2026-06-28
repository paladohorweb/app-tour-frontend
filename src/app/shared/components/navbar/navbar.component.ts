import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
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
    public auth: AuthService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
        this.closeUserMenu();
      });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.closeUserMenu();
    this.router.navigate(['/']);
  }

  get userDisplayName(): string {
    return this.auth.currentUser?.nombre || this.auth.currentUser?.email || 'Usuario';
  }

  get userEmail(): string {
    return this.auth.currentUser?.email || '';
  }

  get userRole(): string {
    return this.auth.getUserRole() || '';
  }

  get userInitial(): string {
    const base = this.auth.currentUser?.nombre || this.auth.currentUser?.email || 'U';
    return base.charAt(0).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideUserMenu = !!target.closest('.user-dropdown');
    const clickedToggler = !!target.closest('.user-toggle');

    if (!clickedInsideUserMenu && !clickedToggler) {
      this.closeUserMenu();
    }
  }
}
