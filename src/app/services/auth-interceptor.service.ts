import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  access_token: string | null;

  constructor(private router: Router) {
    // Comprueba si está guardado el token de autenticación
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.access_token = JSON.parse(storedUser).token;
    } else {
      this.access_token = null;
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.access_token = JSON.parse(storedUser).token;
    }
    if (this.access_token) {
      // Monta la cabecera con el Bearer token
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          Authorization: `Bearer ${this.access_token}`,
        },
      });
    }

    return next.handle(req).pipe(
      // Verifica si la respuesta es 401 para devolver al login
      // Esto ocurre cuando el token expira
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
        return throwError(error);
      })
    );
  }
}
