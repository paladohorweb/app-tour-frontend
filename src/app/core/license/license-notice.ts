import { Component, Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, filter, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({providedIn:'root'})
export class JgmLicenseNotice {
  readonly state=signal<{state:string;portal:string|null}|null>(null);
  update(state:string,portal=''){
    if(['CURRENT','TRIAL','STANDALONE'].includes(state)){this.state.set(null);return;}
    if(!['GRACE','SUSPENDED','MANUAL_SUSPENSION','CANCELLED','TRIAL_EXPIRED','PENDING_PAYMENT','BILLING_NOT_ENABLED','NO_SUBSCRIPTION','INSTALLATION_REVOKED','CONTROL_UNAVAILABLE','CLIENT_BLOCKED','NOT_STARTED','PAYMENT_REVIEW','PENDING_ACTIVATION'].includes(state))return;
    let safe:string|null=null;
    try{const u=new URL(portal);if(u.pathname==='/cliente/suscripciones'&&!u.username&&!u.password&&!u.search&&!u.hash&&(u.protocol==='https:'||(u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname))))safe=u.href;}catch{}
    this.state.set({state,portal:safe});
  }
  clear(){this.state.set(null);}
}
export const jgmLicenseInterceptor:HttpInterceptorFn=(request,next)=>{
  const notice=inject(JgmLicenseNotice);
  const api=new URL(environment.apiUrl,location.origin),url=new URL(request.url,location.origin);
  if(url.origin!==api.origin||!url.pathname.startsWith(api.pathname.replace(/\/$/,'')))return next(request);
  return next(request).pipe(tap(event=>{
    if(event instanceof HttpResponse){
      if(/\/auth\/(?:login|logout)$/.test(url.pathname))notice.clear();
      const state=event.headers.get('X-JGM-License-State');if(state)notice.update(state,event.headers.get('X-JGM-Billing-Url')||'');
    }
  }),catchError((error:HttpErrorResponse)=>{
    if(error.status===402&&error.error?.code==='SUBSCRIPTION_REQUIRED')notice.update('SUSPENDED',error.error.portalUrl);
    if(error.status===503&&error.error?.code==='LICENSE_UNAVAILABLE')notice.update('CONTROL_UNAVAILABLE');
    return throwError(()=>error);
  }));
};
@Component({selector:'app-jgm-license-notice',standalone:true,template:`
@if(license.state();as info){<aside class="jgm-license-notice" role="alert" aria-label="Estado de la suscripción del establecimiento">
  <div><strong>{{ info.state==='GRACE'?'Renovación en periodo de gracia':info.state==='CONTROL_UNAVAILABLE'?'Verificación del servicio pendiente':'Establecimiento en modo consulta' }}</strong>
  <p>{{ info.state==='GRACE'?'La operación continúa durante el plazo de gracia. El responsable del negocio puede regularizar la mensualidad.':info.state==='CONTROL_UNAVAILABLE'?'Las consultas siguen disponibles. Reintenta la operación cuando se restablezca la conexión.':'Las nuevas operaciones están en pausa. Puedes consultar tus datos y contactar al establecimiento.' }}</p></div>
  <div class="jgm-license-actions">@if(info.portal){<a [href]="info.portal" target="_blank" rel="noopener noreferrer">Administrar suscripción del negocio</a>}<button type="button" (click)="reload()">Volver a comprobar</button></div>
</aside>}`,styles:[`.jgm-license-notice{position:relative;z-index:1050;background:#fff7e7;color:#513811;border-bottom:1px solid #e1c88b;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;gap:24px;font:inherit}.jgm-license-notice strong{font-size:.92rem}.jgm-license-notice p{font-size:.84rem;line-height:1.6;margin:6px 0 0;max-width:900px}.jgm-license-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;flex-shrink:0}.jgm-license-actions a,.jgm-license-actions button{font-size:.8rem;color:#513811}.jgm-license-actions button{background:#fff;border:1px solid #cbb172;border-radius:6px;padding:7px 10px}.jgm-license-actions a:focus-visible,.jgm-license-actions button:focus-visible{outline:3px solid #417bd0;outline-offset:3px}@media(max-width:750px){.jgm-license-notice{padding:14px;align-items:flex-start;flex-direction:column;gap:12px}}`]})
export class JgmLicenseNoticeComponent {
  readonly license=inject(JgmLicenseNotice);
  constructor(){inject(Router).events.pipe(filter((e):e is NavigationEnd=>e instanceof NavigationEnd),takeUntilDestroyed()).subscribe(e=>{if(e.urlAfterRedirects==='/'||/^\/(?:login|signup|registro)(?:[/?]|$)/.test(e.urlAfterRedirects))this.license.clear();});}
  reload(){location.reload();}
}
