import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
      return this.authService.isAuthenticated().pipe(
        map((response) => {
            if (response.message === "ADMIN"){
                return true;   
            }
            this.router.navigate(['/']);
            return false;
        }),
        catchError(() => {
          this.router.navigate(['/']);
          return of(false);
        })
      );
    }
}