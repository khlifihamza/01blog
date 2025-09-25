import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReportRequest } from '../../../shared/models/report.model';
import { ReportService } from '../../../core/services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './report-dialog.html',
  styleUrl: './report-dialog.css',
})
export class ReportDialogComponent {
  reportForm: FormGroup;
  isSubmitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReportDialogComponent>,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: { postId: string | null; postTitle: string | null; username: string | null }
  ) {
    this.reportForm = this.fb.group({
      reason: ['', Validators.required],
      details: [''],
    });
  }

  submitReport() {
    if (this.reportForm.valid) {
      this.isSubmitting.set(true);

      const reportData: ReportRequest = {
        reportedPost: this.data.postId,
        reason: this.reportForm.value.reason,
        details: this.reportForm.value.details,
        reportedUsername: this.data.username,
      };

      this.reportService.create(reportData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.dialogRef.close(reportData);
          this.snackBar.open('Blog reported successful', 'Close', { duration: 5000 });
        },
        error: (error) => this.snackBar.open(error.error, 'Close', { duration: 5000 }),
      });
    }
  }
}
