import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${BASE_URL}/auth/login`,
      request
    ).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
      })
    );
  }

  register(request: RegisterRequest) {
    return this.http.post(
      `${API_URL}/auth/register`,
      request
    );
  }

  logout() {
    localStorage.clear();
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get rol(): string | null {
    return localStorage.getItem('rol');
  }

  isLogged(): boolean {
    return !!this.token;
  }
}
