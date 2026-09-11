import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LEGAL } from './legal-content';
import { V2Api } from './api.service';
import { environment } from '../../environments/environment';
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `<section class="v2-wrap">
    <nav class="v2-actions">
      <a routerLink="/legal/terminos">Términos</a
      ><a routerLink="/legal/privacidad">Datos personales</a
      ><a routerLink="/legal/cancelaciones">Cancelaciones</a
      ><a routerLink="/legal/almacenamiento">Almacenamiento</a>
    </nav>
    <h1>{{ doc.title }}</h1>
    <p>Versión {{ version }}</p>
    <div class="v2-panel">
      <strong>{{ operator.name }}</strong>
      <p>
        Identificación: {{ operator.taxId }} · Domicilio: {{ operator.address }}
      </p>
      <p>Atención: {{ operator.email }}</p>
    </div>
    <p class="v2-demo" *ngIf="!operator.configured">
      Documento de preparación. Los datos del responsable deben completarse
      antes de admitir operaciones reales.
    </p>
    <article class="v2-panel v2-prose">{{ doc.body }}</article>
    <a routerLink="/notificaciones">Ejercer mis derechos sobre datos →</a>
  </section>`,
})
export class LegalComponent implements OnInit {
  version = environment.legalVersion;
  doc = LEGAL['terminos'];
  operator: any = {
    name: 'Operador pendiente de configurar',
    taxId: 'Pendiente',
    address: 'Pendiente',
    email: 'Pendiente',
    configured: false,
  };
  constructor(
    private route: ActivatedRoute,
    private api: V2Api,
  ) {}
  ngOnInit() {
    this.route.paramMap.subscribe(
      (p) =>
        (this.doc = LEGAL[p.get('page') || 'terminos'] || LEGAL['terminos']),
    );
    if (!environment.demo)
      this.api
        .get('/legal')
        .subscribe({ next: (o) => (this.operator = o), error: () => {} });
  }
}
