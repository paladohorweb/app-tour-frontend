export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: 'ROLE_ADMIN' | 'ROLE_USER';
}
