export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  rol: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
}
export interface RegisterResponse {
  id: number;
  email: string;
  rol: 'ROLE_USER' | 'ROLE_ADMIN';
}
