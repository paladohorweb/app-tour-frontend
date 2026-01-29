export interface CheckoutRequest {
  tourId: number;
  cantidad: number;
}

export interface CheckoutResponse {
  sessionUrl: string;
}
