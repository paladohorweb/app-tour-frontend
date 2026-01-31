import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { API } from "../constants/api.constants";
import { Tour } from "../models/tour.model";

@Injectable({ providedIn: 'root' })
export class TourService {

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Tour[]>(API.TOURS);
  }

  getById(id: number) {
    return this.http.get<Tour>(`${API.TOURS}/${id}`);
  }

  create(tour: Tour) {
    return this.http.post<Tour>(API.TOURS, tour);
  }

  delete(id: number) {
    return this.http.delete(`${API.TOURS}/${id}`);
  }
}
