import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private injector: Injector) {} 

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = this.injector.get(AuthService); 
    const currentUser = authService.currentUserValue;
    
    if (currentUser) {
      console.log('Dodawanie nagłówka Authorization:', currentUser);
      request = this.addToken(request, currentUser);
    } else {
      console.log('Brak tokenu, wysyłanie żądania bez Authorization');
    }
  
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401 && error.error.code === 'token_not_valid') {
          console.log('Wykryto 401, próbuję odświeżyć token');
          return this.handle401Error(request, next, authService);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler, authService: AuthService) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access);
          console.log('Token odświeżony, ponawiam żądanie');
          return next.handle(this.addToken(request, token.access));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          console.error('Nie udało się odświeżyć tokenu, wylogowanie');
          authService.logout();
          return throwError(err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          console.log('Token odświeżony, ponawiam żądanie z nowym tokenem');
          return next.handle(this.addToken(request, jwt));
        })
      );
    }
  }
}
