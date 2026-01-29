import { Component } from "@angular/core";
import { AuthService } from "../../core/services/auth.service";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="login()">
      <input [(ngModel)]="email" name="email" placeholder="Email">
      <input [(ngModel)]="password" name="password" type="password">
      <button>Login</button>
    </form>
  `
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login({ email: this.email, password: this.password })
      .subscribe(() => this.router.navigate(['/tours']));
  }
}
