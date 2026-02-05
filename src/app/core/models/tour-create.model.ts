
export interface TourCreate {
  nombre: string;
  descripcion?: string;
  ciudad?: string;
  pais?: string;
  imagenUrl?: string;
  latitud?: number | null;
  longitud?: number | null;
  precio: number;
}
