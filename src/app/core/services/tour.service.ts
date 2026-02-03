import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '../constants/api.constants';
import { Tour } from '../models/tour.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TourService {
  createTour(arg0: { nombre: string; descripcion: string; ciudad: string; pais: string; precio: number; imagenUrl: string; latitud: number; longitud: number; }) {
    throw new Error("Method not implemented.");
  }

  private readonly URL = API.BASE_URL + API.TOURS;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.URL);
  }

  create(tour: Tour): Observable<Tour> {
    return this.http.post<Tour>(this.URL, tour);
  }

   toggleActivo(id: number, activo: boolean) {
    return this.http.patch(
      `${API.BASE_URL}${API.TOURS}/${id}/activo`,
      { activo }
    );
  }


  listar(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.URL);
  }
}

