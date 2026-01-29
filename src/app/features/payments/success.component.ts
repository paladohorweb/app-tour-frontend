import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
  <h1>✅ Pago exitoso</h1>
  <p>Gracias por tu compra</p>
  <a routerLink="/">Volver</a>
  `
})
export class SuccessComponent {}

