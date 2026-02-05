export interface AuthUser {
  email: string;
  nombre?: string;
  role?: 'ADMIN' | 'USER';
}
