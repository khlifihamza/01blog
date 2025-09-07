import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  isAuthenticated(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.url + '/check-auth', { withCredentials: true });
  }
}
