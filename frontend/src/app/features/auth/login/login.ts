import { Component, signal } from '@angular/core';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoginRequest } from '../../../shared/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['../auth.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordVisible = false;
  loading = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
    private errorService: ErrorService
  ) {
    this.loginForm = new FormGroup({
      identifier: new FormControl('', {
        validators: [Validators.required],
      }),
      password: new FormControl('', {
        validators: [Validators.required],
      }),
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      return;
    }

    const loginRequest: LoginRequest = {
      identifier: this.loginForm.value.identifier,
      password: this.loginForm.value.password,
    };

    this.loading.set(true);

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.errorService.showSuccess('Logged in successfully!');
        localStorage.setItem('token', response.token.toString());
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorService.handleError(error);
      },
    });
  }

  navigateToSignUp() {
    this.router.navigate(['/register']);
  }
}
