import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '../constants/api.constants';
import { Tour } from '../models/tour.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TourService {

  private readonly URL = API.BASE_URL + API.TOURS;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.URL);
  }

  create(tour: Tour): Observable<Tour> {
    return this.http.post<Tour>(this.URL, tour);
  }
}

