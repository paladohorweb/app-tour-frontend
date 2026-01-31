import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '../constants/api.constants';
import { LoginRequest, AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(
      `${API.BASE_URL}${API.AUTH}/login`,
      data
    );
  }

  register(data: any) {
    return this.http.post(
      `${API.BASE_URL}${API.AUTH}/register`,
      data
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

