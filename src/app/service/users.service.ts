import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_central: boolean;
  selected?: boolean;
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
  
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}/`);
  }
}