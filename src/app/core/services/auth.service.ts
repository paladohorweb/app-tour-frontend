import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthResponse, LoginRequest } from "../models/auth.model";
import { API } from "../constants/api.constants";
import { tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenKey = 'access_token';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(`${API.AUTH}/login`, data)
      .pipe(tap(res => localStorage.setItem(this.tokenKey, res.accessToken)));
  }

  register(data: any) {
    return this.http.post(`${API.AUTH}/register`, data);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  get token() {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<AuthResponse>(
    `${API.AUTH}/refresh`,
      { refreshToken }
    ).pipe(tap(res => this.saveTokens(res)));
  }

    saveTokens(res: AuthResponse) {
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
  }
}

