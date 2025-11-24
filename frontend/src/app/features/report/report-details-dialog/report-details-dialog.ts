import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Report } from '../../../shared/models/report.model';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { ReportStatus } from '../../../shared/models/enums.model';

@Component({
  selector: 'app-report-details-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    TimeAgoPipe,
  ],
  templateUrl: './report-details-dialog.html',
  styleUrl: './report-details-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailsDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ReportDetailsDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: Report
  ) {}

  formatReason(reason: string): string {
    const reasonMap: { [key: string]: string } = {
      spam: 'Spam or Misleading',
      harassment: 'Harassment or Bullying',
      inappropriate: 'Inappropriate Content',
      copyright: 'Copyright Violation',
      misinformation: 'False Information',
      other: 'Other',
    };
    return reasonMap[reason] || reason;
  }

  navigateToContent() {
    if (this.data.postId) {
      this.dialogRef.close();
      this.router.navigate(['/post', this.data.postId]);
    }
  }

  navigateToProfile() {
    if (this.data.ReportedUser) {
      this.dialogRef.close();
      this.router.navigate(['/profile', this.data.ReportedUser]);
    }
  }

  resolveReport() {
    this.data.status = ReportStatus.RESOLVED;
    this.dialogRef.close({ action: 'resolved', report: this.data });
  }

  dismissReport() {
    this.data.status = ReportStatus.DISMISSED;
    this.dialogRef.close({ action: 'dismissed', report: this.data });
  }
}
