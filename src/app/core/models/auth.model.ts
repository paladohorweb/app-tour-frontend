export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  rol: 'USER' | 'ADMIN';
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}
export interface RegisterResponse {
  id: number;
  email: string;
  rol: 'USER' | 'ADMIN';
}
