import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { decodeJwt } from '../utils/jwt.utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly BASE_URL = API.BASE_URL + API.AUTH;

   private readonly TOKEN_KEY = 'access_token';

  constructor(private http: HttpClient) {}

  // ============================
  // LOGIN
  // ============================
  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/login`, payload)
      .pipe(
        tap(res => {
          this.setSession(res);
        })
      );
  }

  // ============================
  // REGISTER
  // ============================
  register(payload: {
    nombre: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/register`, payload);
  }

  // ============================
  // TOKEN MANAGEMENT
  // ============================
  private setSession(authResponse: any): void {
    localStorage.setItem('TOKEN_KEY', authResponse.accessToken);
    localStorage.setItem('refresh_token', authResponse.refreshToken);
  }

   saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

 getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('refresh_token');
  }
    isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

    getUserRole(): 'ADMIN' | 'USER' | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = decodeJwt(token);
    return payload?.rol ?? null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }
}
