import { Component } from "@angular/core";

@Component({
  standalone: true,
  template: `
  <h1>❌ Pago cancelado</h1>
  <p>Intenta nuevamente</p>
  <a routerLink="/">Volver</a>
  `
})
export class CancelComponent {}
