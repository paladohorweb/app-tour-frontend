import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserProfile } from "../models/userProfilr.models";

@Injectable({ providedIn: 'root' })
export class UserService {
  [x: string]: any;

  private api = `${this["apiUrl"]}`+ '/users/me';

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get<UserProfile>(this.api);
  }
}
