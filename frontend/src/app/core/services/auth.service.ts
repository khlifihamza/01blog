import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, RegistrationRequest, LoginRequest, LoginResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:8080/api/auth';
  private role: String = "USER";

  constructor(private http: HttpClient) {}

  register(userData: RegistrationRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.url + '/register', userData);
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.url}/login`, credentials);
  }

  logout(): void {
    localStorage.removeItem("token");
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  setRole(role: String): void{
    this.role = role;
  }

  isAdmin(): boolean {
    return this.role == "ADMIN";
  }
}
