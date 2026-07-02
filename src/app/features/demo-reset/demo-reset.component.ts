import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { DemoStoreService } from '../../core/demo/demo-store.service';

@Component({
  standalone: true,
  selector: 'app-demo-reset',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './demo-reset.component.html',
  styleUrls: ['./demo-reset.component.css']
})
export class DemoResetComponent {
  resetting = false;

  constructor(
    private readonly demoStore: DemoStoreService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  async resetDemo(): Promise<void> {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: '¿Restablecer la demo?',
      text:
        'Se eliminarán los tours creados, las reservas y los cambios realizados en este navegador.',
      showCancelButton: true,
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b45309',
      reverseButtons: true
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    this.resetting = true;

    try {
      /*
       * Restablece únicamente las llaves locales
       * utilizadas por el modo demo.
       */
      this.demoStore.resetDemoData();

      /*
       * Cierra sesión para que el usuario vuelva
       * a iniciar con los usuarios demo iniciales.
       */
      this.authService.logout();

      await Swal.fire({
        icon: 'success',
        title: 'Demo restablecida',
        text:
          'Los datos iniciales fueron restaurados correctamente.',
        timer: 1800,
        showConfirmButton: false
      });

      await this.router.navigateByUrl('/');
    } catch (error) {
      console.error('Error restableciendo demo:', error);

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo restablecer la demo',
        text:
          'Ocurrió un problema al restaurar los datos locales.'
      });
    } finally {
      this.resetting = false;
    }
  }
}
