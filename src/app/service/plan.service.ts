import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private apiUrl = "http://127.0.0.1:8000/planner/";

  constructor( private http: HttpClient) { }

  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/`)
  }

}
