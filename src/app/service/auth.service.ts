// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/auth'; // Upewnij się, że baseUrl wskazuje na /auth/
  
  private currentUserSubject: BehaviorSubject<string | null>;
  public currentUser: Observable<string | null>;

  private userProfileSubject: BehaviorSubject<any | null>;
  public userProfile: Observable<any | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const token = localStorage.getItem('access_token');
    this.currentUserSubject = new BehaviorSubject<string | null>(token);
    this.currentUser = this.currentUserSubject.asObservable();

    this.userProfileSubject = new BehaviorSubject<any | null>(null);
    this.userProfile = this.userProfileSubject.asObservable();

    if (token) {
      console.log('Token znaleziony w localStorage, ładowanie profilu...');
      this.loadProfile().subscribe(
        profile => {
          console.log('Profil załadowany w konstruktorze:', profile);
          this.userProfileSubject.next(profile);
        },
        error => {
          console.error('Nie udało się załadować profilu w konstruktorze', error);
          this.logout();
        }
      );
    }
  }

  public get currentUserValue(): string | null {
    return this.currentUserSubject.value;
  }

  public get userProfileValue(): any | null {
    return this.userProfileSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    console.log('Próba logowania:', username);
    return this.http.post<any>(`${this.baseUrl}/login/`, { username, password }).pipe(
      tap((response) => {
        console.log('Odpowiedź logowania:', response);
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.currentUserSubject.next(response.access);
        console.log('Token ustawiony w currentUserSubject:', this.currentUserSubject.value);
      }),
      switchMap(() => this.loadProfile()), // Czeka na załadowanie profilu
      tap(profile => {
        console.log('Profil załadowany po logowaniu:', profile);
        this.userProfileSubject.next(profile);
      }),
      catchError(error => {
        console.error('Błąd logowania:', error);
        return throwError(error);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register/`, userData);
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('Wylogowywanie, refresh token:', refreshToken);
    
    if (!refreshToken) {
      console.log('Brak refresh tokena, wyczyść dane i przejdź do logowania');
      this.clearAuthData();
      this.router.navigate(['/login']);
      return;
    }

    this.http.post(`${this.baseUrl}/logout/`, { refresh: refreshToken }).subscribe(
      () => {
        console.log('Wylogowanie zakończone sukcesem');
        this.clearAuthData();
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Błąd wylogowania:', error);
        // Nawet jeśli wylogowanie z serwera się nie powiedzie, wyczyść dane lokalne
        this.clearAuthData();
        this.router.navigate(['/login']);
      }
    );
  }
  
  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.userProfileSubject.next(null);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('Odświeżanie tokenu za pomocą refresh token:', refreshToken);
    return this.http.post<any>(`${this.baseUrl}/refresh/`, {
      refresh: refreshToken,
    }).pipe(
      tap((response) => {
        console.log('Token odświeżony:', response);
        localStorage.setItem('access_token', response.access);
        this.currentUserSubject.next(response.access);
      }),
      catchError(error => {
        console.error('Błąd odświeżania tokenu:', error);
        this.logout();
        return throwError(error);
      })
    );
  }

  getProfile(): Observable<any> {
    console.log('Pobieranie profilu użytkownika...');
    return this.http.get<any>(`${this.baseUrl}/profile/`).pipe( // Używa poprawnego endpointu /auth/profile/
      tap(profile => {
        console.log('Pobrano profil:', profile);
      }),
      catchError(error => {
        console.error('Błąd pobierania profilu:', error);
        return throwError(error);
      })
    );
  }

  loadProfile(): Observable<any> {
    return this.getProfile().pipe(
      tap(profile => {
        // Możesz dodatkowo przetwarzać dane profilu tutaj, jeśli to konieczne
      })
    );
  }
}
