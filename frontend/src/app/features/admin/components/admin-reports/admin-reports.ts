import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Report } from '../../../../shared/models/report.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { InfiniteScrollDirective } from '../../../../shared/directives/infinite-scroll.directive';
import { ReportStatus } from '../../../../shared/models/enums.model';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TimeAgoPipe,
    InfiniteScrollDirective
  ],
  templateUrl: './admin-reports.html',
  styleUrls: ['../../admin.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminReportsComponent {
  @Input() reports: Report[] = [];
  @Input() hasMoreReports = false;
  @Input() isLoadingMoreReports = false;
  @Input() isMobile = false;

  @Output() loadMore = new EventEmitter<void>();
  @Output() viewReport = new EventEmitter<Report>();
  @Output() resolveReport = new EventEmitter<Report>();
  @Output() dismissReport = new EventEmitter<Report>();
  @Output() viewUser = new EventEmitter<string>();
  @Output() banUser = new EventEmitter<string>();
  @Output() viewPost = new EventEmitter<string>();
  @Output() hidePost = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();

  reportColumns = ['post/user', 'reason', 'reportedBy', 'status', 'date', 'actions'];
  selectedReportStatus = '';
  ReportStatus = ReportStatus;

  onFilterChange(value: string) {
    this.selectedReportStatus = value;
    this.filterChange.emit(value);
  }
}
