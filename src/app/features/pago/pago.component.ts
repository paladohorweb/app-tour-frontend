import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

import { PaymentService } from '../../core/services/payment.service';
import { ReservaService, ReservaResponse, MetodoPago } from '../../core/services/reserva.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-pago',
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {

  loading = true;
  paying = false;
  error = '';

  reserva?: ReservaResponse;

  metodoPago: MetodoPago = 'TARJETA';
  metodos: MetodoPago[] = ['TARJETA', 'PSE', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA', 'EFECTIVO'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const reservaId = Number(this.route.snapshot.paramMap.get('reservaId'));
      if (!reservaId) {
        throw new Error('reservaId inválido');
      }

      this.reserva = await firstValueFrom(this.reservaService.obtenerReserva(reservaId));
      this.loading = false;

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || e?.message || 'No se pudo cargar la reserva';
      this.loading = false;
    }
  }

  async pagar(): Promise<void> {
    if (!this.reserva) return;

    this.error = '';
    this.paying = true;

    try {
      const res = await firstValueFrom(
        this.paymentService.crearIntentoPago(this.reserva.id, this.metodoPago)
      );

      // Pago manual / simulado
      if (res.provider === 'MANUAL') {
        await Swal.fire({
          icon: 'success',
          title: 'Pago registrado',
          text: 'La reserva quedó pagada correctamente'
        });

        this.router.navigate(['/order/success'], {
          queryParams: { reservaId: this.reserva.id }
        });
        return;
      }

      // Wompi
      if (res.provider === 'WOMPI' && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      throw new Error('No se recibió una respuesta válida del proveedor de pago');

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || e?.message || 'No se pudo procesar el pago';
      this.paying = false;

      await Swal.fire({
        icon: 'error',
        title: 'Error de pago',
        text: this.error
      });
    }
  }
}
