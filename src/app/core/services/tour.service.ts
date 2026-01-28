import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Tour } from "../models/tour";


@Injectable({ providedIn: 'root' })
export class TourService {

  private api = 'http://localhost:8086/api/tours';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Tour[]>(this.api);
  }

  obtener(id: number) {
    return this.http.get<Tour>(`${this.api}/${id}`);
  }
}
