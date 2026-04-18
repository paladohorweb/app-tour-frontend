import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: async () => {
        this.loading = false;

        await Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión correcto',
          timer: 1300,
          showConfirmButton: false
        });

        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin/tours']);
          return;
        }

        if (this.auth.isGuia()) {
          this.router.navigate(['/guia/panel']);
          return;
        }

        this.router.navigate(['/tours']);
      },
      error: async (err) => {
        this.loading = false;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo iniciar sesión',
          text: err?.error?.message || 'Verifica tus credenciales'
        });
      }
    });
  }
}
