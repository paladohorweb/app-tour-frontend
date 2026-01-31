export interface Tour {
  id: number;
  nombre: string;
  descripcion: string;
  ciudad: string;
  pais: string;
  imagenUrl: string;
  latitud: number;
  longitud: number;
  precio?: number;
}
