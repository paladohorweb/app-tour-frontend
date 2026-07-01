import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';

type RolRegistro = 'ROLE_USER' | 'ROLE_GUIA';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  loading = false;
  error = '';

  passwordVisible = false;
  confirmPasswordVisible = false;

  public returnUrl = '/tours';

  readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      rol: this.fb.nonNullable.control<RolRegistro>('ROLE_USER')
    },
    {
      validators: [this.passwordsMatchValidator]
    }
  );

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const requestedReturnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '';

    this.returnUrl = this.sanitizeReturnUrl(requestedReturnUrl);

    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, email, password, rol } = this.form.getRawValue();

    this.loading = true;
    this.error = '';

    this.authService.register({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
      rol
    }).subscribe({
      next: async () => {
        this.loading = false;

        await Swal.fire({
          icon: 'success',
          title: 'Cuenta creada correctamente',
          text: 'Ahora puedes iniciar sesión para continuar.',
          confirmButtonText: 'Iniciar sesión'
        });

        this.router.navigate(['/login'], {
          queryParams: {
            email: email.trim().toLowerCase(),
            returnUrl: this.returnUrl
          }
        });
      },
      error: (err) => {
        console.error('Error registrando usuario:', err);

        this.error =
          err?.error?.message ||
          'No fue posible crear la cuenta. Verifica tus datos e intenta nuevamente.';

        this.loading = false;
      }
    });
  }

  get passwordsDoNotMatch(): boolean {
    return Boolean(
      this.form.touched &&
      this.form.errors?.['passwordsDoNotMatch']
    );
  }

  private passwordsMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordsDoNotMatch: true };
  }

  private sanitizeReturnUrl(value: string): string {
    if (!value.startsWith('/') || value.startsWith('//')) {
      return '/tours';
    }

    return value;
  }
}
