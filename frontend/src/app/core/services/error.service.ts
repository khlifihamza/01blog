import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../shared/models/error.model';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: HttpErrorResponse): void {
    let panelClass = ['error-snackbar'];

    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && typeof error.error === 'object') {
      const errorResponse = error.error as ErrorResponse;
      errorMessage = errorResponse.message || errorResponse.error;
    } else {
      errorMessage = this.standardErrorMessage(error);
    }

    this.showError(errorMessage, panelClass);
  }

  private standardErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Invalid request';
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 500:
        return 'Server error occurred. Please try again later';
      default:
        return 'An unexpected error occurred';
    }
  }

  private showError(message: string, panelClass: string[] = ['error-snackbar']): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  showWarning(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
