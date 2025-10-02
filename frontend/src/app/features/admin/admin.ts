import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Report } from '../../shared/models/report.model';
import { User } from '../../shared/models/user.model';
import { Post } from '../../shared/models/post.model';
import { AdminService } from '../../core/services/admin.service';
import { Insights } from '../../shared/models/admin.model';
import { ReportDetailsDialogComponent } from '../report/report-details-dialog/report-details-dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../shared/models/confirm-dialog.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NavbarComponent } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatToolbarModule,
    MatBadgeModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    NavbarComponent,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  // Stats
  insights = signal<Insights | null>(null);
  totalUsers = signal(0);
  totalPosts = signal(0);
  pendingReports = signal(0);
  totalEngagement = signal(0);

  // Table columns
  reportColumns = ['post/user', 'reason', 'reportedBy', 'status', 'date', 'actions'];
  userColumns = ['user', 'role', 'posts', 'joinDate', 'status', 'actions'];
  postColumns = ['title', 'author', 'engagement', 'date', 'status', 'actions'];

  // Data
  reports = signal<Report[]>([]);
  users = signal<User[]>([]);
  posts = signal<Post[]>([]);

  // Filtered data
  filteredReports = signal<Report[]>([]);

  // Filters
  selectedReportStatus = '';
  userSearchQuery = new FormControl('');
  postSearchQuery = new FormControl('');

  constructor(
    private router: Router,
    private adminService: AdminService,
    private location: Location,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  setupSearch() {
    this.userSearchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.adminService.searchUsers(searchValue!.toLowerCase()).subscribe({
          next: (users) => {
            this.users.set(users);
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      });
    this.postSearchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.adminService.searchPosts(searchValue!.toLowerCase()).subscribe({
          next: (posts) => {
            this.posts.set(posts);
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      });
  }

  loadData() {
    this.loadInsights();
    this.loadReports();
    this.loadUsers();
    this.loadPosts();
  }

  loadInsights() {
    this.adminService.getInsights().subscribe({
      next: (insights) => {
        this.totalUsers.set(insights.totalUsers);
        this.totalPosts.set(insights.totalPosts);
        this.pendingReports.set(insights.pendingReports);
        this.totalEngagement.set(insights.totalEngagement);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadReports() {
    this.adminService.getReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.filterReports();
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadPosts() {
    this.adminService.getPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.filterPosts();
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }

  filterReports() {
    const reports = this.selectedReportStatus
      ? this.reports().filter((r) => r.status.toLowerCase() === this.selectedReportStatus)
      : this.reports();
    this.filteredReports.set(reports);
  }

  // searchUsers() {
  //   this.adminService.searchUsers(this.userSearchQuery.toLowerCase()).subscribe({
  //     next: (users) => {
  //       this.users.set(users);
  //     },
  //     error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
  //   });
  // }

  filterPosts() {}

  viewReport(report: Report) {
    const detailedReport = {
      ...report,
      type: report.postId ? 'POST' : 'USER',
    };

    const dialogRef = this.dialog.open(ReportDetailsDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: detailedReport,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.action === 'resolved') {
          this.resolveReport(result.report);
        }
        if (result.action === 'dismissed') {
          this.dismissReport(result.report);
        }
      }
    });
  }

  resolveReport(report: Report) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Resolve Report',
        message: 'Are you sure you want to resolve this report?',
        confirmText: 'Resolve',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.resolveReport(report.id).subscribe({
          next: () => {
            report.status = 'RESOLVED';
            this.pendingReports.update((value) => Math.max(0, value - 1));
            this.updateReport(report);
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }

  dismissReport(report: Report) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Dismiss Report',
        message: 'Are you sure you want to dismiss this report?',
        confirmText: 'Dismiss',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.dismissReport(report.id).subscribe({
          next: () => {
            report.status = 'DISMISSED';
            this.pendingReports.update((value) => Math.max(0, value - 1));
            this.updateReport(report);
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }

  updateReport(report: Report) {
    this.reports.update((reports) => {
      const index = reports.findIndex((r) => r.id === report.id);
      if (index > -1) {
        const updated = [...reports];
        updated[index] = report;
        return updated;
      }
      return reports;
    });

    this.filterReports();
  }

  viewUser(username: string) {
    this.router.navigate(['/profile', username]);
  }

  banUser(username: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Ban User',
        message: 'Are you sure you want to ban this user?',
        confirmText: 'Ban',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.banUser(username).subscribe({
          next: () => {
            const user = this.users().find((u) => u.username === username);
            if (user) {
              user.status = 'BANNED';
            }
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }

  unbanUser(username: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Unban User',
        message: 'Are you sure you want to unban this user?',
        confirmText: 'Unban',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.unbanUser(username).subscribe({
          next: () => {
            const user = this.users().find((u) => u.username === username);
            if (user) {
              user.status = 'ACTIVE';
            }
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Delete User',
        message: 'Are you sure you want to delete this user?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.deleteUser(user.username).subscribe({
          next: () => {
            this.users.set(this.users().filter((u) => u.id !== user.id));
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }

  viewPost(postId: string) {
    this.router.navigate(['/post', postId]);
  }

  hidePost(postId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Hide Post',
        message: 'Are you sure you want to hide this post?',
        confirmText: 'Hide',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.hidePost(postId).subscribe({
          next: () => {
            const post = this.posts().find((p) => p.id === postId);
            if (post) {
              post.status = 'HIDDEN';
            }
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }

  unhidePost(postId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Unhide Post',
        message: 'Are you sure you want to unhide this post?',
        confirmText: 'Unhide',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.unhidePost(postId).subscribe({
          next: () => {
            const post = this.posts().find((p) => p.id === postId);
            if (post) {
              post.status = 'PUBLISHED';
            }
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }

  deletePost(post: Post) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Delete Post',
        message: 'Are you sure you want to delete this post?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.adminService.deletePost(post.id).subscribe({
          next: () => {
            this.posts.set(this.posts().filter((p) => p.id !== post.id));
            this.filterPosts();
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }
}
