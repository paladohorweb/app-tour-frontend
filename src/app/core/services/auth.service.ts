import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API } from '../constants/api.constants';
import { decodeJwt } from '../utils/jwt.utils';
import { AuthUser } from '../models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = API.BASE_URL + API.AUTH;
  private readonly TOKEN_KEY = 'access_token';

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // ✅ al refrescar la página, reconstruye el usuario desde el token
    this.refreshUserFromToken();
  }

  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/login`, payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(payload: { nombre: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/register`, payload);
  }

  private setSession(authResponse: any): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem('refresh_token', authResponse.refreshToken);

    // ✅ actualiza estado UI
    this.refreshUserFromToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('refresh_token');
    this.userSubject.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /** ✅ robusto: soporta claim role o rol y soporta ROLE_ADMIN o ADMIN */
  getUserRole(): 'ADMIN' | 'USER' | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload: any = decodeJwt(token);
    const raw = payload?.role ?? payload?.rol;
    if (!raw || typeof raw !== 'string') return null;

    const normalized = raw.replace('ROLE_', '').toUpperCase();
    return (normalized === 'ADMIN' || normalized === 'USER') ? (normalized as any) : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  /** ✅ reconstruye usuario desde token (email + nombre si viene) */
  refreshUserFromToken(): void {
    const token = this.getAccessToken();
    if (!token) {
      this.userSubject.next(null);
      return;
    }

    const payload: any = decodeJwt(token);

    const email = payload?.sub ?? payload?.email ?? null;
    const nombre = payload?.nombre ?? payload?.name ?? undefined;
    const role = this.getUserRole() ?? undefined;

    if (!email) {
      this.userSubject.next(null);
      return;
    }

    this.userSubject.next({ email, nombre, role });
  }

  /** útil para navbar */
  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }
}
