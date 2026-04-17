import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../core/services/payment.service';
import { ReservaService, MetodoPago } from '../../core/services/reserva.service';
import { TourService } from '../../core/services/tour.service';
import { Tour } from '../../core/models/tour.model';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  loading = true;
  paying = false;
  error = '';

  tour?: Tour;
  reservaId?: number;

  metodoPago: MetodoPago = 'TARJETA';
  metodos: MetodoPago[] = ['TARJETA', 'PSE', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA', 'EFECTIVO'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourService: TourService,
    private reservaService: ReservaService,
    private paymentService: PaymentService
  ) {}

  async ngOnInit() {
    try {
      const tourId = Number(this.route.snapshot.paramMap.get('tourId'));
      if (!tourId) throw new Error('tourId inválido');

      this.tour = await firstValueFrom(this.tourService.obtenerPorId(tourId));
      const reserva = await firstValueFrom(this.reservaService.crearReserva(tourId));
      this.reservaId = reserva.id;

      this.loading = false;
    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || 'No se pudo iniciar el checkout';
      this.loading = false;
    }
  }

  async pagar() {
    if (!this.reservaId) return;

    this.error = '';
    this.paying = true;

    try {
      const res = await firstValueFrom(
        this.paymentService.crearIntentoPago(this.reservaId, this.metodoPago)
      );

      if (res.provider === 'MANUAL') {
        await Swal.fire({
          icon: 'success',
          title: 'Pago registrado',
          text: 'La reserva quedó pagada correctamente'
        });
        this.router.navigate(['/order/success'], {
          queryParams: { reservaId: this.reservaId }
        });
        return;
      }

      if (res.provider === 'WOMPI' && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      throw new Error('No se recibió una URL de checkout válida');

    } catch (e: any) {
      console.error(e);
      this.error = e?.error?.message || e?.message || 'No se pudo procesar el pago';
      this.paying = false;

      Swal.fire({
        icon: 'error',
        title: 'Pago no procesado',
        text: this.error
      });
    }
  }
}
