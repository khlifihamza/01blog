import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse, RegistrationRequest, LoginRequest } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:8080/api/auth';
  constructor(private http: HttpClient) {}

  register(userData: RegistrationRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + '/register', userData);
  }

  login(credentials: LoginRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + '/login', credentials, { withCredentials: true });
  }

  logout(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.url + '/logout', { withCredentials: true });
  }

  //   getToken(): string | null {
  //     return localStorage.getItem(this.tokenKey);
  //   }

  //   get currentUser(): User | null {
  //     return this.currentUserSubject.value;
  //   }

  //   isAuthenticated(): boolean {
  //     return !!this.getToken() && !!this.currentUser;
  //   }

  //   isAdmin(): boolean {
  //     return this.currentUser?.role === 'ADMIN';
  //   }

  //   refreshToken(): Observable<AuthResponse> {
  //     // Mock token refresh
  //     if (this.currentUser) {
  //       const response: AuthResponse = {
  //         token: 'refreshed_token_' + this.currentUser.id,
  //         user: this.currentUser
  //       };
  //       localStorage.setItem(this.tokenKey, response.token);
  //       return of(response);
  //     }
  //     throw new Error('No user to refresh token for');
  //   }
}
