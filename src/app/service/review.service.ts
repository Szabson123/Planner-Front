import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  machine_name: string;
  date: string;
  description: string;
  done: boolean;
  machine_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://127.0.0.1:8000/machines/';

  constructor(private http: HttpClient) { }

  getReviews(machineId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}${machineId}/reviews/`);
  }

  addReview(machineId: number, review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}${machineId}/reviews/`, review);
  }

  updateReview(id: number, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}${id}/`, review);
  }

  toggleReviewDone(machineId: number, reviewId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}${machineId}/reviews/${reviewId}/change_to_true_false/`, {});
  }

  deleteReview(machineId: number, reviewId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${machineId}/reviews/${reviewId}/`);
  }

  getallReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`http://127.0.0.1:8000/machines/reviews/all/`);
  }
}
