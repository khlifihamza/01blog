import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable, tap } from 'rxjs';
import { ApiResponse, RegistrationRequest, LoginRequest } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(userData: RegistrationRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + '/register', userData);
  }

  login(credentials: LoginRequest): Observable<ApiResponse> {
    return this.http
      .post<any>(
        `${this.url}/login`,
        credentials,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap((response) => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.url + '/logout', { withCredentials: true }).pipe(
    tap(() => {
      this.currentUserSubject.next(null);
    }));
  }

  get currentUserValue() {
      return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean{
    return this.currentUserValue.role == "ADMIN";
  }

  isAuthenticated(): Observable<any> {
    return this.http.get<any>(`${this.url}/check-auth`, { withCredentials: true }).pipe(
      tap((user) => {
        if (user) {
          this.currentUserSubject.next(user);
        }
      })
    );
  }
}
