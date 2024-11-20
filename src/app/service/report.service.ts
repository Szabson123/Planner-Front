import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Report {
  id: number;
  date: string;
  text: string;
  user: number;
  user_name: string;
  images: RaportImg[];
}

export interface RaportImg {
  id?: number;
  img: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = "http://127.0.0.1:8000/raport/raports/";

  constructor(private http: HttpClient) {}

  getReportsByUser(userId: number): Observable<Report[]> {
    const params = new HttpParams().set('user', userId.toString());
    return this.http.get<Report[]>(`${this.apiUrl}`, { params });
  }

  addRaport(text: string, images: File[]): Observable<HttpEvent<Report>> {
    const formData: FormData = new FormData();
    formData.append('text', text);

    images.forEach((image) => {
      formData.append('images', image, image.name);
    });

    return this.http.post<Report>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Nieznany błąd!';
    if (error.error instanceof ErrorEvent) {
      // Błąd klienta
      errorMessage = `Błąd: ${error.error.message}`;
    } else {
      // Błąd serwera
      errorMessage = `Kod błędu: ${error.status}\nWiadomość: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
