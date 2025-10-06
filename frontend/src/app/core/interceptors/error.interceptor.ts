import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorService } from '../services/error.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorService = inject(ErrorService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
    //   errorService.handleError(error);
      return throwError(() => error);
    })
  );
};