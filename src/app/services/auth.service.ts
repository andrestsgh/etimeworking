import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthDTO } from '../models/auth.dto';
import { SharedService } from './shared.service';
import { Router } from '@angular/router';

export interface AuthToken {
  user_id: string;
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private urlBlogUocApi: string;
  private controller: string;
  //private currentUserSubject: BehaviorSubject<any>;
  
  constructor(private http: HttpClient, private sharedService: SharedService, private router: Router) {
    this.controller = 'login';
    this.urlBlogUocApi = 'http://laravel.local:8000/api/' + this.controller;
    const user = localStorage.getItem('access_token');
    //this.currentUserSubject = new BehaviorSubject<any>(user ? JSON.parse(user) : null);
    //this.currentUser = this.currentUserSubject.asObservable();
  }

  login(auth: AuthDTO): Observable<AuthToken> {
    return this.http
      .post<AuthToken>(this.urlBlogUocApi, auth)
      .pipe(catchError(this.sharedService.handleError));
  }

  logout(): Observable<any> {
    return new Observable((observer) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');

      //this.currentUserSubject.next(null);

      this.router.navigate(['/login']);

      observer.next();
      observer.complete();
    });
  }
}
