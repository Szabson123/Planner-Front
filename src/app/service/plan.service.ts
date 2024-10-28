import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './users.service';

export interface Event {
  user: User;
  date: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  overtime: number;
  count_hours: number; 
}

export interface Shift {
  users: User;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
}

export interface FreeDay {
  user: User;
  date: string;
  reason: string;
}

export interface HolyDay {
  user: User;
  date: string;
  name: string;
}

export interface Availability {
  user?: any;
  date: string;
  acceptance: string;
}

export interface Weekend {
  user: User;
  date: string;
  shift_name: string;
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

  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/shifts/`);
  }

  getFreeDays(): Observable<FreeDay[]> {
    return this.http.get<FreeDay[]>(`${this.apiUrl}/free_day/`);
  }
  getHolyDay(): Observable<HolyDay[]> {
    return this.http.get<HolyDay[]>(`${this.apiUrl}/holyday/`);
  }
  getHolyDayForMonth(month: string): Observable<HolyDay[]> {
    return this.http.get<HolyDay[]>(`${this.apiUrl}/holyday/?month=${month}`);
  }
  getEventsForMonth(month: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/?month=${month}`);
  }
  getFreeDaysForMonth(month: string): Observable<FreeDay[]> {
    return this.http.get<FreeDay[]>(`${this.apiUrl}/free_day/?month=${month}`);
  }

  getWeekends(): Observable<Weekend[]> {
    return this.http.get<Weekend[]>(`${this.apiUrl}/weekend/`);
  }
  getWeekendsForMonth(month: string): Observable<Weekend[]> {
    return this.http.get<Weekend[]>(`${this.apiUrl}/weekend/?month=${month}`);
  }

  getAvailability(): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/availability/`);
  }
  getAvailabilityForMonth(month: string): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/availability/?month=${month}`);
  }

  generatePlanner(): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate-planner/`, {});
  }

  restorePlanner(): Observable<any> {
    return this.http.post(`${this.apiUrl}/restore-plan/`, {});
  }

  addFreeDays(start_date: string, end_date: string, reason: string):Observable<any>{
    const payload = {start_date, end_date, reason};
    return this.http.post<any>(`${this.apiUrl}/free_day/`, payload)
    
  }
  addAvailability(availability: Availability): Observable<Availability> {
    return this.http.post<Availability>(`${this.apiUrl}/availability/`, availability);
  }

  addShift(shift: Shift): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/shifts/`, shift)
  }
  
  // Metody pobierania szczegółów dla poszczególnych typów
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}/`);
  }

  getFreeDayById(id: number): Observable<FreeDay> {
    return this.http.get<FreeDay>(`${this.apiUrl}/free_day/${id}/`);
  }

  getWeekendById(id: number): Observable<Weekend> {
    return this.http.get<Weekend>(`${this.apiUrl}/weekend/${id}/`);
  }
}
