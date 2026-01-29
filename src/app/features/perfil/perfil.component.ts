import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { UserProfile } from "../../core/models/userProfilr.models";
import { UserService } from "../../core/services/user.service";

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <h2>Mi Perfil</h2>

  <div *ngIf="user">
    <p><b>Nombre:</b> {{ user.nombre }}</p>
    <p><b>Email:</b> {{ user.email }}</p>
    <p><b>Rol:</b> {{ user.rol }}</p>
  </div>
  `
})
export class ProfileComponent {

  user!: UserProfile;

  constructor(private service: UserService) {}

  ngOnInit() {
    this.service.getProfile().subscribe(res => this.user = res);
  }
}

