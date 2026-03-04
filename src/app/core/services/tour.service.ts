import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { Tour } from '../models/tour.model';
import { TourCreate } from '../models/tour-create.model';

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly URL = API.BASE_URL + API.TOURS;

  constructor(private http: HttpClient) {}

  listar(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.URL);
  }

  obtenerPorId(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.URL}/${id}`);
  }

  crear(dto: TourCreate): Observable<Tour> {
    return this.http.post<Tour>(this.URL, dto);
  }

  actualizar(id: number, dto: TourCreate): Observable<Tour> {
    return this.http.put<Tour>(`${this.URL}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }

  // SOLO si tu backend lo tiene:
  toggleActivo(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.URL}/${id}/activo`, { activo });
  }

  listarAdmin(): Observable<Tour[]> {
  return this.http.get<Tour[]>(`${API.BASE_URL}/admin${API.TOURS}`);
}
}
