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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  filteredUsers = signal<User[]>([]);
  filteredPosts = signal<Post[]>([]);

  // Filters
  selectedReportStatus = '';
  selectedPostCategory = '';
  userSearchQuery = '';
  postSearchQuery = '';

  constructor(
    private router: Router,
    private adminService: AdminService,
    private location: Location,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
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
      error: (error) => console.log(error),
    });
  }

  loadReports() {
    this.adminService.getReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.filterReports();
      },
      error: (error) => console.log(error),
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filterUsers();
      },
      error: (error) => console.log(error),
    });
  }

  loadPosts() {
    this.adminService.getPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.filterPosts();
      },
      error: (error) => console.log(error),
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

  filterUsers() {
    const users = this.userSearchQuery
      ? this.users().filter(
          (u) =>
            u.username.toLowerCase().includes(this.userSearchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(this.userSearchQuery.toLowerCase())
        )
      : this.users();
    this.filteredUsers.set(users);
  }

  filterPosts() {
    const posts = this.postSearchQuery
      ? this.posts().filter((p) =>
          p.title.toLowerCase().includes(this.postSearchQuery.toLowerCase())
        )
      : this.posts();
    this.filteredPosts.set(posts);
  }

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
        console.log('Report action taken:', result.report);
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
    this.adminService.resolveReport(report.id).subscribe({
      next: () => {
        report.status = 'RESOLVED';
        this.pendingReports.update((value) => Math.max(0, value - 1));
        this.updateReport(report);
      },
      error: (error) => console.log(error),
    });
  }

  dismissReport(report: Report) {
    this.adminService.dismissReport(report.id).subscribe({
      next: () => {
        report.status = 'DISMISSED';
        this.pendingReports.update((value) => Math.max(0, value - 1));
        this.updateReport(report);
      },
      error: (error) => console.log(error),
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
    this.adminService.banUser(username).subscribe({
      next: () => {
        const user = this.users().find((u) => u.username === username);
        if (user) {
          user.status = 'BANNED';
        }
      },
      error: (error) => console.log(error),
    });
  }

  unbanUser(username: string) {
    this.adminService.unbanUser(username).subscribe({
      next: () => {
        const user = this.users().find((u) => u.username === username);
        if (user) {
          user.status = 'ACTIVE';
        }
      },
      error: (error) => console.log(error),
    });
  }

  deleteUser(user: User) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(user.username).subscribe({
        next: () => {
          this.users.set(this.users().filter((u) => u.id !== user.id));
          this.filterUsers();
        },
        error: (error) => console.log(error),
      });
    }
  }

  viewPost(postId: string) {
    this.router.navigate(['/post', postId]);
  }

  hidePost(postId: string) {
    this.adminService.hidePost(postId).subscribe({
      next: () => {
        const post = this.posts().find((p) => p.id === postId);
        if (post) {
          post.status = 'HIDDEN';
        }
      },
      error: (error) => console.log(error),
    });
  }

  unhidePost(postId: string) {
    this.adminService.unhidePost(postId).subscribe({
      next: () => {
        const post = this.posts().find((p) => p.id === postId);
        if (post) {
          post.status = 'PUBLISHED';
        }
      },
      error: (error) => console.log(error),
    });
  }

  deletePost(post: Post) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.adminService.deletePost(post.id).subscribe({
        next: () => {
          this.posts.set(this.posts().filter((p) => p.id !== post.id));
          this.filterPosts();
        },
        error: (error) => console.log(error),
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
