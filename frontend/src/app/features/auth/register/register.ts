import { Component, signal } from '@angular/core';
import {
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControlOptions,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { RegistrationRequest } from '../../../shared/models/user.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.html',
  styleUrls: ['../auth.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  passwordVisible = signal(false);
  confirmPasswordVisible = signal(false);
  loading = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
    private errorService: ErrorService
  ) {
    this.registerForm = new FormGroup(
      {
        username: new FormControl('', {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(15),
            Validators.pattern(/^[a-zA-Z0-9\-]+$/),
          ],
        }),
        email: new FormControl('', {
          validators: [Validators.required, Validators.email],
        }),
        password: new FormControl('', {
          validators: [Validators.required, Validators.minLength(8), Validators.maxLength(24)],
        }),
        confirmPassword: new FormControl('', {
          validators: [Validators.required, Validators.minLength(8), Validators.maxLength(24)],
        }),
      },
      { validators: this.passwordMatchValidator } as FormControlOptions
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility() {
    this.passwordVisible.set(!this.passwordVisible());
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible.set(!this.confirmPasswordVisible());
  }

  onSubmit() {
    if (!this.registerForm.valid) {
      return;
    }

    const registrationRequest: RegistrationRequest = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
    };

    this.loading.set(true);

    this.authService.register(registrationRequest).subscribe({
      next: () => {
        this.loading.set(false);
        this.errorService.showSuccess('Account created successfully!');
        this.navigateToLogin();
      },
      error: (error) => {
        this.loading.set(false);
        this.errorService.handleError(error);
      },
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
