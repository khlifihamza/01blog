import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoginRequest } from '../../../shared/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordVisible = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      return;
    }

    const registrationRequest: LoginRequest = {
      identifier: this.loginForm.value.identifier,
      password: this.loginForm.value.password,
    };

    this.loading = true;

    this.authService.login(registrationRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open('Login successful', 'Close');
        localStorage.setItem("token", response.token.toString());
        this.authService.setRole(response.role);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error?.error || 'Login failed', 'Close', { duration: 5000 });
      },
    });
  }

  navigateToSignUp() {
    this.router.navigate(['/register']);
  }
}
