import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './users.service';

export interface Event {
  user: User;
  date: string;
  shift: string;
  start_time: string;
  end_time: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private apiUrl = "http://127.0.0.1:8000/planner";

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/`);
  }
}
