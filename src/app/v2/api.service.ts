import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class V2Api {
  readonly base = environment.apiUrl + '/v2';
  constructor(private http: HttpClient) {}
  get<T>(p: string) {
    return this.http.get<T>(this.base + p);
  }
  post<T>(p: string, d: unknown) {
    return this.http.post<T>(this.base + p, d);
  }
  put<T>(p: string, d: unknown) {
    return this.http.put<T>(this.base + p, d);
  }
  patch<T>(p: string, d: unknown = {}) {
    return this.http.patch<T>(this.base + p, d);
  }
}
export function navigationUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat + ',' + lng)}&travelmode=driving&dir_action=navigate`;
}
export function whatsappUrl(phone: string, text: string) {
  return /^57[0-9]{10}$/.test(phone)
    ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    : '';
}
