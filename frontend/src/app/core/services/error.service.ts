import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred';
    let panelClass = ['error-snackbar'];
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = 'Network error occurred. Please check your connection.';
    } else {
      switch (error.status) {
        case 400:
          errorMessage = this.getValidationErrorMessage(error.error) || 'Invalid request';
          panelClass = ['warning-snackbar'];
          break;
        case 401:
          errorMessage = 'Please log in to continue';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          panelClass = ['info-snackbar'];
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later';
          break;
        default:
          errorMessage = error.error?.message || 'An unexpected error occurred';
      }
    }

    this.showError(errorMessage, panelClass);
  }

  private getValidationErrorMessage(errorBody: any): string {
    if (typeof errorBody === 'string') {
      return errorBody;
    }
    if (typeof errorBody === 'object' && errorBody !== null) {
      const errors = Object.values(errorBody);
      return errors.join(', ');
    }
    return '';
  }

  private showError(message: string, panelClass: string[] = ['error-snackbar']): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  showWarning(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}