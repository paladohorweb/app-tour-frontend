import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <h2>Registro</h2>

      <form (ngSubmit)="register()" #form="ngForm">
        <input
          type="text"
          name="nombre"
          [(ngModel)]="nombre"
          placeholder="Nombre"
          required
        />

        <input
          type="email"
          name="email"
          [(ngModel)]="email"
          placeholder="Email"
          required
        />

        <input
          type="password"
          name="password"
          [(ngModel)]="password"
          placeholder="Contraseña"
          required
        />

        <button type="submit" [disabled]="form.invalid">
          Registrarse
        </button>
      </form>

      <p class="link">
        ¿Ya tienes cuenta?
        <a (click)="goLogin()">Inicia sesión</a>
      </p>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
      margin: 60px auto;
      padding: 20px;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 20px;
    }

    input {
      width: 100%;
      padding: 10px;
      margin-bottom: 12px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    button {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 4px;
      background: #1976d2;
      color: #fff;
      font-weight: bold;
      cursor: pointer;
    }

    button:disabled {
      background: #aaa;
    }

    .link {
      margin-top: 15px;
      text-align: center;
    }

    a {
      cursor: pointer;
      color: #1976d2;
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {

  nombre = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    const payload = {
      nombre: this.nombre,
      email: this.email,
      password: this.password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        // registro exitoso → ir a login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en registro', err);
        alert(err.error?.message || 'Error al registrar');
      }
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
