import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { ProfileService } from '../../../core/services/profile.service';
import { EditUserProfile } from '../../../shared/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../../shared/models/confirm-dialog.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatToolbarModule,
    MatSnackBarModule,
    NavbarComponent,
  ],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfileComponent{
  currentProfile = signal<EditUserProfile | null>(null);
  profileForm: FormGroup;
  isLoading = signal(false);
  newAvatarFile: File | null = null;
  newAvatarPreview = signal<string | null | undefined>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private profileService: ProfileService,
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      bio: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit() {
    this.loadCurrentProfile();
  }

  loadCurrentProfile() {
    this.profileService.getEditProfileDetails().subscribe({
      next: (profile) => {
        this.currentProfile.set(profile);
        this.newAvatarPreview.set(
          this.currentProfile()?.avatar ? this.currentProfile()?.avatar : 'default-avatar.png'
        );
        this.profileForm.patchValue(this.currentProfile()!);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  onAvatarSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newAvatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading.set(true);
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: <ConfirmDialogData>{
          title: 'Update Profile',
          message: 'Are you sure you want to Update your profile data?',
          confirmText: 'Update',
          cancelText: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.isLoading.set(true);
          const updateData = (avatar: string | null) => {
            const profileData: EditUserProfile = {
              ...this.profileForm.value,
              avatar: avatar,
            };
            this.profileService.EditProfileDetails(profileData).subscribe({
              next: () => {
                this.isLoading.set(false);
                this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
                this.router.navigate(['/profile']);
              },
              error: (error) => {
                this.snackBar.open(error.message, 'Close', { duration: 5000 });
                this.isLoading.set(false);
              },
            });
          };

          if (this.newAvatarFile) {
            const formData = new FormData();
            formData.append('avatar', this.newAvatarFile);
            this.profileService.uploadAvatar(formData).subscribe({
              next: (response) => updateData(response.avatar.toString()),
              error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
            });
          } else {
            const avatar =
              this.newAvatarPreview() === 'default-avatar.png'
                ? null
                : this.currentProfile()!.avatar;
            updateData(avatar);
          }
        }
      });
    }
  }
}
