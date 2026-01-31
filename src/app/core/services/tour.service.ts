import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Tour } from "../models/tour.model";
import { API } from "../constants/api.constants";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class TourService {

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Tour[]>(
      `${API.BASE_URL}${API.TOURS}`
    );
  }
    crear(tour: Tour): Observable<Tour> {
    return this.http.post<Tour>('/api/tours', tour);
  }
}
