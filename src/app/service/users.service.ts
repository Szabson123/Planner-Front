import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})

export class UsersService {
  private apiUrl = "http://127.0.0.1:8000/users";

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/`);
  }
}