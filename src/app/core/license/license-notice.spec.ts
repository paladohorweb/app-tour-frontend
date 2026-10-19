import { TestBed } from '@angular/core/testing';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting,HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { JgmLicenseNotice,jgmLicenseInterceptor } from './license-notice';
import { environment } from '../../../environments/environment';
describe('JGMSolutions subscription notice',()=>{
 let http:HttpClient,backend:HttpTestingController,notice:JgmLicenseNotice;
 const url=environment.apiUrl.replace(/\/$/,'')+'/license-test';
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(withInterceptors([jgmLicenseInterceptor])),provideHttpClientTesting()]});http=TestBed.inject(HttpClient);backend=TestBed.inject(HttpTestingController);notice=TestBed.inject(JgmLicenseNotice);});
 afterEach(()=>backend.verify());
 it('shows suspension while preserving successful read-only data',()=>{let data:any;http.get(url).subscribe(r=>data=r);backend.expectOne(url).flush({history:[]},{headers:{'X-JGM-License-State':'SUSPENDED','X-JGM-Billing-Url':'https://billing.example/cliente/suscripciones'}});expect(data).toEqual({history:[]});expect(notice.state()?.state).toBe('SUSPENDED');});
 it('preserves the original blocked-write error for the operation form',()=>{let error:any;http.post(url,{}).subscribe({error:e=>error=e});backend.expectOne(url).flush({code:'SUBSCRIPTION_REQUIRED',portalUrl:'https://billing.example/cliente/suscripciones'},{status:402,statusText:'Payment required'});expect(error.status).toBe(402);expect(notice.state()?.state).toBe('SUSPENDED');});
 it('never turns an unsafe billing URL into a link',()=>{notice.update('SUSPENDED','javascript:alert(1)');expect(notice.state()?.portal).toBeNull();notice.update('SUSPENDED','https://user:password@evil.example/cliente/suscripciones');expect(notice.state()?.portal).toBeNull();});
 it('clears the notice when the server confirms reactivation',()=>{notice.update('SUSPENDED');http.get(url).subscribe();backend.expectOne(url).flush({},{headers:{'X-JGM-License-State':'CURRENT'}});expect(notice.state()).toBeNull();});
 it('does not trust subscription headers from another API origin',()=>{http.get('https://unrelated.example/value').subscribe();backend.expectOne('https://unrelated.example/value').flush({},{headers:{'X-JGM-License-State':'SUSPENDED'}});expect(notice.state()).toBeNull();});
});
