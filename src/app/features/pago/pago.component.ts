import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import {
  EstadoReserva,
  MetodoPago,
  ReservaResponse,
  ReservaService
} from '../../core/services/reserva.service';

import {
  CreateIntentResponse,
  PaymentService
} from '../../core/services/payment.service';

interface MetodoPagoOption {
  value: MetodoPago;
  title: string;
  description: string;
  icon: string;
}

@Component({
  standalone: true,
  selector: 'app-pago',
  imports: [CommonModule, RouterLink],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {
  reserva?: ReservaResponse;

  loading = true;
  procesando = false;
  error = '';

  metodoSeleccionado: MetodoPago = 'TARJETA';

  readonly metodos: MetodoPagoOption[] = [
    {
      value: 'TARJETA',
      title: 'Tarjeta',
      description: 'Crédito o débito',
      icon: '💳'
    },
    {
      value: 'PSE',
      title: 'PSE',
      description: 'Pago desde tu banco',
      icon: '🏦'
    },
    {
      value: 'NEQUI',
      title: 'Nequi',
      description: 'Pago desde tu celular',
      icon: '📱'
    },
    {
      value: 'DAVIPLATA',
      title: 'Daviplata',
      description: 'Billetera digital',
      icon: '📲'
    }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly reservaService: ReservaService,
    private readonly paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const reservaId = Number(this.route.snapshot.paramMap.get('reservaId'));

    if (!Number.isInteger(reservaId) || reservaId <= 0) {
      this.error = 'La reserva seleccionada no es válida.';
      this.loading = false;
      return;
    }

    this.cargarReserva(reservaId);
  }

  cargarReserva(reservaId: number): void {
    this.loading = true;
    this.error = '';

    this.reservaService.obtenerReserva(reservaId).subscribe({
      next: (reserva) => {
        this.reserva = reserva;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando reserva:', err);

        this.error =
          err?.error?.message ||
          'No fue posible cargar la información de la reserva.';

        this.loading = false;
      }
    });
  }

  seleccionarMetodo(metodo: MetodoPago): void {
    this.metodoSeleccionado = metodo;
  }

  iniciarPago(): void {
    if (!this.reserva || this.reserva.estado !== 'PENDIENTE') {
      return;
    }

    this.procesando = true;

    this.paymentService
      .crearIntentoPago(this.reserva.id, this.metodoSeleccionado)
      .subscribe({
        next: async (respuesta) => {
          this.procesando = false;
          await this.procesarRespuestaPago(respuesta);
        },
        error: async (err) => {
          console.error('Error iniciando pago:', err);
          this.procesando = false;

          await Swal.fire({
            icon: 'error',
            title: 'No fue posible iniciar el pago',
            text:
              err?.error?.message ||
              'Ocurrió un error con el proveedor de pagos.'
          });
        }
      });
  }

async procesarRespuestaPago(
  respuesta: CreateIntentResponse
): Promise<void> {
  if (respuesta.provider === 'DEMO') {
    await Swal.fire({
      icon: 'success',
      title: 'Pago aprobado',
      text:
        'Tu reserva fue pagada correctamente en el modo demostración.'
    });

    this.router.navigate(['/order/success'], {
      queryParams: {
        reservaId: respuesta.reservaId
      }
    });

    return;
  }

  if (respuesta.checkoutUrl) {
    window.location.assign(respuesta.checkoutUrl);
    return;
  }

  if (respuesta.clientSecret) {
    await Swal.fire({
      icon: 'info',
      title: 'Pago preparado',
      text:
        'El proveedor devolvió una intención de pago. Consulta el estado de la reserva mientras termina el proceso.'
    });

    this.router.navigate(['/order/success'], {
      queryParams: {
        reservaId: this.reserva?.id
      }
    });

    return;
  }

  await Swal.fire({
    icon: 'info',
    title: 'Solicitud de pago creada',
    text:
      'No se recibió una URL de pago. Consulta el estado de la reserva para ver las instrucciones disponibles.'
  });

  this.router.navigate(['/order/success'], {
    queryParams: {
      reservaId: this.reserva?.id
    }
  });
}

  get puedePagar(): boolean {
    return this.reserva?.estado === 'PENDIENTE';
  }

  estadoClase(estado?: EstadoReserva): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'status-badge status-pending';

      case 'PAGADA':
        return 'status-badge status-paid';

      case 'EN_CURSO':
        return 'status-badge status-progress';

      case 'FINALIZADA':
        return 'status-badge status-finished';

      case 'CANCELADA':
        return 'status-badge status-cancelled';

      case 'FALLIDA':
        return 'status-badge status-failed';

      default:
        return 'status-badge';
    }
  }
}
