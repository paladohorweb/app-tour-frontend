import { MetodoPago } from './../services/reserva.service';
export interface PagoRequest {
  reservaId: number;
  metodoPago:MetodoPago
}
export interface PagoResponse {
  clientSecret: string;
}
