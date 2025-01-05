import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AuthDTO } from '../models/auth.dto';
import { SharedService } from './shared.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private urlApi: string;
  private currentUserSubject = new BehaviorSubject<AuthDTO | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Monta la ruta de llamada a la api de login
  constructor(private http: HttpClient, 
              private sharedService: SharedService, 
              private router: Router) {
    this.urlApi = sharedService.host+'/api/login';
  }

  /***** login: manda una petición de autenticación POST al servidor con las credenciales */
  login(auth: AuthDTO): Observable<AuthDTO> {
    this.sharedService.showLoading("Identificando usuario...");
    return this.http
      // Manda la petición con las credenciales de usuario
      .post<AuthDTO>(this.urlApi, auth)
      .pipe(tap((user) => {
        // Avisa al menú lateral para que se muestre
        this.currentUserSubject.next(user);
      }),
      catchError((error: HttpErrorResponse) => {
        // Muestra el mensaje devuelto por el servidor
        this.sharedService.showToast(error.error.error,'danger',1000);
        return throwError(error);
      }),
      finalize(() => {
        this.sharedService.hideLoading();
      }));
  }
  
  /***** logout: Elimina los datos del usuario */
  logout(): Observable<any> {
    return new Observable((observer) => {
      // Elimina los datos persistentes
      localStorage.removeItem('user');
      localStorage.removeItem('remember');
      // Sin contrato seleccionado
      this.sharedService.selectedOptionContract = null;
      // El menú lateral dejará de mostrarse
      this.currentUserSubject.next(null);
      // Devuelve a la vista de login
      this.router.navigate(['/login']);
      observer.next();
      observer.complete();
    });
  }
}
