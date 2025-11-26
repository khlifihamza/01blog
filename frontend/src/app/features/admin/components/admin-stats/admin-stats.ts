import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './admin-stats.html',
  styleUrls: ['../../admin.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminStatsComponent {
  @Input() totalUsers = 0;
  @Input() totalPosts = 0;
  @Input() pendingReports = 0;
  @Input() totalEngagement = 0;
}
