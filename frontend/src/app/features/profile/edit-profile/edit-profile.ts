import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar';
import { ProfileService } from '../../../core/services/profile.service';
import { EditUserProfileResponse } from '../../../shared/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../../shared/models/confirm-dialog.model';
import { MatDialog } from '@angular/material/dialog';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-edit-profile',
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
    NavbarComponent,
  ],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfileComponent {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  currentProfile = signal<EditUserProfileResponse | null>(null);
  profileForm: FormGroup;
  isLoading = signal(false);
  newAvatarFile: File | null = null;
  newAvatarPreview = signal<string | null | undefined>(null);

  constructor(
    private router: Router,
    private errorService: ErrorService,
    private profileService: ProfileService,
    private dialog: MatDialog
  ) {
    this.profileForm = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
      }),
      username: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
          Validators.pattern(/^[a-zA-Z0-9\-]+$/),
        ],
      }),
      bio: new FormControl('', {
        validators: [Validators.maxLength(500)],
      }),
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
      error: (error) => this.errorService.handleError(error),
    });
  }

  onAvatarSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.newAvatarFile = file;
      if (this.newAvatarPreview()) {
        URL.revokeObjectURL(this.newAvatarPreview()!);
      }
      const objectUrl = URL.createObjectURL(file);
      this.newAvatarPreview.set(objectUrl);
    } else if (!file.type.startsWith('image/')) {
      this.errorService.showWarning('Unsupported File type');
    }
  }

  deleteAvatar(event: Event): void {
    event.stopPropagation();
    if (this.newAvatarPreview()) {
      URL.revokeObjectURL(this.newAvatarPreview()!);
    }
    this.profileForm.patchValue({ avatar: null });
    this.newAvatarPreview.set('default-avatar.png');
    this.newAvatarFile = null;
    if (this.avatarInput?.nativeElement) {
      this.avatarInput.nativeElement.value = '';
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
          if (this.newAvatarFile) {
            const formData = new FormData();
            formData.append('avatar', this.newAvatarFile);
          }
          const formData = new FormData();
          formData.append('username', this.profileForm.value.username);
          formData.append('email', this.profileForm.value.email);
          formData.append('bio', this.profileForm.value.bio);
          if (this.newAvatarFile) {
            formData.append('avatar', this.newAvatarFile);
          }
          if (this.newAvatarPreview() === 'default-avatar.png') {
            formData.append('defaultAvatar', this.newAvatarPreview()!);
          }
          this.profileService.EditProfileDetails(formData).subscribe({
            next: (response) => {
              this.isLoading.set(false);
              this.errorService.showSuccess('Profile updated successfully!');
              this.router.navigate([`/profile/${response.message}`]);
            },
            error: (error) => {
              this.errorService.handleError(error);
              this.isLoading.set(false);
            },
          });
        }
      });
    }
  }
}
