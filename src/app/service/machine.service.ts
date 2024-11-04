import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Machine {
  id: number;
  name: string;
  location: string;
  description: string;
}

export interface MachineWholeInfo extends Machine {
  review: Review[];
  common: CommonIssue[];
  knowhow: KnowHow[];
  rare: RareIssue[];
}

export interface Review {
  id: number;
  machine_name: string;
  date: string;
  description: string;
  done: boolean;
}

export interface CommonIssue {
  id: number;
  name: string;
  added_data: string;
  what_problem: string;
  how_fix: string;
  machine_name: string;
}

export interface RareIssue {
  id: number;
  name: string;
  data: string;
  what_problem: string;
  how_fix: string;
  machine_name: string;
}

export interface KnowHow {
  id: number;
  machine_name: string;
  name: string;
  added_data: string;
  how_to_do: string;
}

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private apiUrl = 'http://127.0.0.1:8000/machines/'; 

  constructor(private http: HttpClient) { }

  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.apiUrl);
  }

  getMachineById(id: number): Observable<MachineWholeInfo> {
    return this.http.get<MachineWholeInfo>(`${this.apiUrl}${id}/with_items/`);
  }

  addMachine(machine: Partial<Machine>): Observable<Machine> {
    return this.http.post<Machine>(this.apiUrl, machine);
  }

  updateMachine(id: number, machine: Partial<Machine>): Observable<Machine> {
    return this.http.put<Machine>(`${this.apiUrl}${id}/`, machine);
  }

  deleteMachine(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
