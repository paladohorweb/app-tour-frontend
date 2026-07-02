import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { DEMO_MODE } from '../../core/constants/demo.constants';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  error = '';
  passwordVisible = false;
  readonly demoMode = DEMO_MODE;

  returnUrl = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

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

    const email = this.route.snapshot.queryParamMap.get('email');

    if (email) {
      this.form.controls.email.setValue(email);
    }

    if (this.authService.isAuthenticated()) {
      this.navigateAfterLogin();
    }
  }

  get isCheckoutReturn(): boolean {
    return this.returnUrl.startsWith('/checkout/');
  }

  useDemo(email: string): void {
    this.form.patchValue({
      email,
      password: 'demo123'
    });

    this.submit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.form.getRawValue();

    this.authService.login({
      email: email.trim().toLowerCase(),
      password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.navigateAfterLogin();
      },
      error: (err) => {
        console.error('Error iniciando sesiÃ³n:', err);

        this.error =
          err?.error?.message ||
          'Correo o contraseÃ±a incorrectos. Verifica tus datos.';

        this.loading = false;
      }
    });
  }

  private navigateAfterLogin(): void {
    const destination =
      this.returnUrl || this.getDefaultDestinationByRole();

    this.router.navigateByUrl(destination);
  }

  private getDefaultDestinationByRole(): string {
    switch (this.authService.getUserRole()) {
      case 'ADMIN':
        return '/admin/dashboard';

      case 'GUIA':
        return '/guia/panel';

      case 'USER':
        return '/mis-reservas';

      default:
        return '/tours';
    }
  }

  private sanitizeReturnUrl(value: string): string {
    if (!value.startsWith('/') || value.startsWith('//')) {
      return '';
    }

    return value;
  }
}



