import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { API } from '../constants/api.constants';
import { decodeJwt } from '../utils/jwt.utils';
import { AuthUser } from '../models/auth-user.model';

type UserRole = 'ADMIN' | 'USER' | 'GUIA';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly BASE_URL = API.BASE_URL + API.AUTH;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);

  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.refreshUserFromToken();
  }

  login(payload: {
    email: string;
    password: string;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.BASE_URL}/login`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(payload: {
    nombre: string;
    email: string;
    password: string;
    rol: 'ROLE_USER' | 'ROLE_GUIA';
  }): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/register`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.userSubject.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const payload = this.getTokenPayload(token);

    if (!token || !payload) {
      return false;
    }

    if (this.isTokenExpired(payload)) {
      this.logout();
      return false;
    }

    return true;
  }

  getUserRole(): UserRole | null {
    const token = this.getAccessToken();
    const payload = this.getTokenPayload(token);

    if (!payload || this.isTokenExpired(payload)) {
      return null;
    }

    const rawRole =
      payload?.role ??
      payload?.rol ??
      (Array.isArray(payload?.roles) ? payload.roles[0] : null);

    if (!rawRole || typeof rawRole !== 'string') {
      return null;
    }

    const normalized = rawRole.replace('ROLE_', '').toUpperCase();

    if (
      normalized === 'ADMIN' ||
      normalized === 'USER' ||
      normalized === 'GUIA'
    ) {
      return normalized as UserRole;
    }

    return null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isGuia(): boolean {
    return this.getUserRole() === 'GUIA';
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  refreshUserFromToken(): void {
    const token = this.getAccessToken();
    const payload = this.getTokenPayload(token);

    if (!token || !payload || this.isTokenExpired(payload)) {
      this.logout();
      return;
    }

    const email = payload?.sub ?? payload?.email ?? null;
    const nombre = payload?.nombre ?? payload?.name ?? undefined;
    const role = this.getUserRole() ?? undefined;

    if (!email) {
      this.logout();
      return;
    }

    this.userSubject.next({
      email,
      nombre,
      role
    });
  }

  private setSession(authResponse: any): void {
    if (!authResponse?.accessToken) {
      throw new Error('La respuesta de autenticación no contiene accessToken.');
    }

    localStorage.setItem(this.TOKEN_KEY, authResponse.accessToken);

    if (authResponse?.refreshToken) {
      localStorage.setItem(
        this.REFRESH_TOKEN_KEY,
        authResponse.refreshToken
      );
    }

    this.refreshUserFromToken();
  }

  private getTokenPayload(token: string | null): any | null {
    if (!token) {
      return null;
    }

    try {
      return decodeJwt(token);
    } catch {
      return null;
    }
  }

  private isTokenExpired(payload: any): boolean {
    if (typeof payload?.exp !== 'number') {
      return false;
    }

    return payload.exp * 1000 <= Date.now();
  }
}
