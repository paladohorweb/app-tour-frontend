export interface PagoRequest {
  tourId: number;
   cantidad: number;
}
export interface PagoResponse {
  clientSecret: string;
}
