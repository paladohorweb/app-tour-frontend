import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <section class="admin-container">
      <router-outlet></router-outlet>
    </section>
  `
})
export class AdminComponent {}
