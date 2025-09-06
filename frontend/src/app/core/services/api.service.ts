import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RegistrationResponse, RegistrationRequest } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private url = "http://localhost:8080/api/auth";
    constructor(private http: HttpClient) {}

    register(userData: RegistrationRequest): Observable<RegistrationResponse> {
        return this.http.post<RegistrationResponse>(this.url + "/register", userData);
    }

//   login(credentials: UserLogin): Observable<AuthResponse> {
//     // Mock login for development
//     const user = this.mockUsers.find(u => 
//       u.username === credentials.username && credentials.password === 'password'
//     );
    
//     if (user) {
//       const response: AuthResponse = {
//         token: 'mock_jwt_token_' + user.id,
//         user
//       };
      
//       localStorage.setItem(this.tokenKey, response.token);
//       localStorage.setItem(this.userKey, JSON.stringify(response.user));
//       this.currentUserSubject.next(response.user);
      
//       return of(response);
//     } else {
//       throw new Error('Invalid credentials');
//     }
//   }

//   logout(): void {
//     localStorage.removeItem(this.tokenKey);
//     localStorage.removeItem(this.userKey);
//     this.currentUserSubject.next(null);
//   }

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