import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const authorizedRequest =
    request.url.includes('/login') || request.url.includes('/register')
      ? request
      : request.clone({
          headers: request.headers.set('Authorization', `Bearer ${token}`),
        });

  return next(authorizedRequest).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
