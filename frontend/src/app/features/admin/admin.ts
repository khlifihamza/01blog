import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatBadgeModule } from '@angular/material/badge';

import { Report } from '../../shared/models/report.model';
import { User } from '../../shared/models/user.model';
import { Post } from '../../shared/models/post.model';
import { AdminService } from '../../core/services/admin.service';
import { Insights } from '../../shared/models/admin.model';
import { ReportDetailsDialogComponent } from '../report/report-details-dialog/report-details-dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../shared/models/confirm-dialog.model';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { ReportStatus } from '../../shared/models/enums.model';

import { AdminStatsComponent } from './components/admin-stats/admin-stats';
import { AdminReportsComponent } from './components/admin-reports/admin-reports';
import { AdminUsersComponent } from './components/admin-users/admin-users';
import { AdminPostsComponent } from './components/admin-posts/admin-posts';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    NavbarComponent,
    AdminStatsComponent,
    AdminReportsComponent,
    AdminUsersComponent,
    AdminPostsComponent,
    MatBadgeModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit {
  insights = signal<Insights | null>(null);
  totalUsers = signal(0);
  totalPosts = signal(0);
  pendingReports = signal(0);
  totalEngagement = signal(0);

  isMobile = signal(false);
  isTablet = signal(false);

  reports = signal<Report[]>([]);
  users = signal<User[]>([]);
  posts = signal<Post[]>([]);

  selectedReportStatus = '';
  
  hasMoreReports = signal(true);
  isLoadingMoreReports = signal(false);

  hasMoreUsers = signal(true);
  isLoadingMoreUsers = signal(false);

  hasMorePosts = signal(true);
  isLoadingMorePosts = signal(false);

  hasMoreUserSearchResults = signal(true);
  hasMorePostSearchResults = signal(true);
  isLoadingMoreUserSearch = signal(false);
  isLoadingMorePostSearch = signal(false);

  activeTabIndex = 0;
  
  // Keep track of current search queries
  currentUserSearch = '';
  currentPostSearch = '';

  constructor(
    private router: Router,
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {
    this.adminService.getInsights().subscribe({
      next: (insights) => {
        this.pendingReports.set(insights.pendingReports);
      },
    });

    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe((result) => {
      this.isMobile.set(result.matches);
    });

    this.breakpointObserver.observe([Breakpoints.Tablet]).subscribe((result) => {
      this.isTablet.set(result.matches);
    });
  }

  ngOnInit() {
    this.loadData();
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
  }

  onUserSearch(searchValue: string) {
    this.currentUserSearch = searchValue;
    this.hasMoreUserSearchResults.set(true);

    if (searchValue) {
      this.adminService.searchUsers(searchValue.toLowerCase(), '').subscribe({
        next: (users) => {
          this.users.set(users);
          this.hasMoreUserSearchResults.set(users.length >= 10);
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    } else {
      this.loadUsers();
    }
  }

  onPostSearch(searchValue: string) {
    this.currentPostSearch = searchValue;
    this.isLoadingMorePostSearch.set(true);

    if (searchValue) {
      this.adminService.searchPosts(searchValue.toLowerCase(), '').subscribe({
        next: (posts) => {
          this.posts.set(posts);
          this.hasMorePostSearchResults.set(posts.length === 10);
          this.isLoadingMorePostSearch.set(false);
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    } else {
      this.loadPosts();
    }
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
    this.adminService.getReports(this.selectedReportStatus, '').subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.hasMoreReports.set(reports.length >= 10);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadUsers() {
    this.adminService.getUsers('').subscribe({
      next: (users) => {
        this.users.set(users);
        this.hasMoreUsers.set(users.length >= 10);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadPosts() {
    this.adminService.getPosts('').subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.hasMorePosts.set(posts.length === 10);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadMoreReports() {
    if (this.isLoadingMoreReports() || !this.hasMoreReports()) return;

    this.isLoadingMoreReports.set(true);

    const lastReport = this.reports()[this.reports().length - 1];
    if (!lastReport) return;

    this.adminService.getReports(this.selectedReportStatus, lastReport.createdAt).subscribe({
      next: (newReports) => {
        this.reports.update((currentReports) => [
          ...currentReports,
          ...newReports,
        ]);
        this.hasMoreReports.set(newReports.length === 10);
        this.isLoadingMoreReports.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Close', { duration: 5000 });
        this.isLoadingMoreReports.set(false);
      },
    });
  }

  loadMoreUsers() {
    if (this.activeTabIndex === 1 && this.currentUserSearch) {
      if (this.hasMoreUserSearchResults() && !this.isLoadingMoreUserSearch()) {
        this.loadMoreUserSearchResults();
      }
      return;
    }

    if (this.isLoadingMoreUsers() || !this.hasMoreUsers()) return;

    this.isLoadingMoreUsers.set(true);

    const lastUser = this.users()[this.users().length - 1];
    if (!lastUser) return;

    this.adminService.getUsers(lastUser.joinDate).subscribe({
      next: (newUsers) => {
        this.users.update((currentUsers) => [...currentUsers, ...newUsers]);
        this.hasMoreUsers.set(newUsers.length === 10);
        this.isLoadingMoreUsers.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Close', { duration: 5000 });
        this.isLoadingMoreUsers.set(false);
      },
    });
  }

  loadMorePosts() {
    if (this.activeTabIndex === 2 && this.currentPostSearch) {
      if (this.hasMorePostSearchResults() && !this.isLoadingMorePostSearch()) {
        this.loadMorePostSearchResults();
      }
      return;
    }

    if (this.isLoadingMorePosts() || !this.hasMorePosts()) return;

    this.isLoadingMorePosts.set(true);

    const lastPost = this.posts()[this.posts().length - 1];
    if (!lastPost) return;

    this.adminService.getPosts(lastPost.publishedDate).subscribe({
      next: (newPosts) => {
        this.posts.update((currentPosts) => [...currentPosts, ...newPosts]);
        this.hasMorePosts.set(newPosts.length === 10);
        this.isLoadingMorePosts.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Close', { duration: 5000 });
        this.isLoadingMorePosts.set(false);
      },
    });
  }

  onFilterReports(status: string) {
    this.selectedReportStatus = status;
    this.loadReports();
  }

  loadMoreUserSearchResults() {
    if (
      this.isLoadingMoreUserSearch() ||
      !this.hasMoreUserSearchResults() ||
      !this.currentUserSearch
    )
      return;

    this.isLoadingMoreUserSearch.set(true);

    const lastUser = this.users()[this.users().length - 1];
    if (!lastUser) return;

    this.adminService
      .searchUsers(this.currentUserSearch.toLowerCase(), lastUser.joinDate)
      .subscribe({
        next: (newUsers) => {
          this.users.update((currentUsers) => [...currentUsers, ...newUsers]);
          this.hasMoreUserSearchResults.set(newUsers.length >= 10);
          this.isLoadingMoreUserSearch.set(false);
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Close', { duration: 5000 });
          this.isLoadingMoreUserSearch.set(false);
        },
      });
  }

  loadMorePostSearchResults() {
    if (
      this.isLoadingMorePostSearch() ||
      !this.hasMorePostSearchResults() ||
      !this.currentPostSearch
    )
      return;

    this.isLoadingMorePostSearch.set(true);

    const lastPost = this.posts()[this.posts().length - 1];
    if (!lastPost) return;

    this.adminService
      .searchPosts(this.currentPostSearch.toLowerCase(), lastPost.publishedDate)
      .subscribe({
        next: (newPosts) => {
          this.posts.update((currentPosts) => [...currentPosts, ...newPosts]);
          this.hasMorePostSearchResults.set(newPosts.length === 10);
          this.isLoadingMorePostSearch.set(false);
        },
        error: (error) => {
          this.snackBar.open(error.message, 'Close', { duration: 5000 });
          this.isLoadingMorePostSearch.set(false);
        },
      });
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
        report.status = ReportStatus.RESOLVED;
        this.updateReport(report);
        this.adminService.resolveReport(report.id).subscribe({
          next: () => {
            this.adminService.getInsights().subscribe({
              next: (insights) => {
                this.pendingReports.set(insights.pendingReports);
              },
            });
          },
          error: (error) => {
            report.status = ReportStatus.PENDING;
            this.updateReport(report);
            this.snackBar.open(error.message, 'Close', { duration: 5000 });
          },
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
        report.status = ReportStatus.DISMISSED;
        this.updateReport(report);
        this.adminService.dismissReport(report.id).subscribe({
          next: () => {
            this.adminService.getInsights().subscribe({
              next: (insights) => {
                this.pendingReports.set(insights.pendingReports);
              },
            });
          },
          error: (error) => {
            report.status = ReportStatus.PENDING;
            this.updateReport(report);
            this.snackBar.open(error.message, 'Close', { duration: 5000 });
          },
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

    this.onFilterReports(this.selectedReportStatus);
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
            this.users.update((currentUsers) => {
              return currentUsers.map((user) => {
                if (user.username === username) {
                  return { ...user, status: 'BANNED' };
                }
                return user;
              });
            });
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
            this.users.update((currentUsers) => {
              return currentUsers.map((user) => {
                if (user.username === username) {
                  return { ...user, status: 'ACTIVE' };
                }
                return user;
              });
            });
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
            this.posts.update((currentPosts) => {
              return currentPosts.map((post) => {
                if (post.id === postId) {
                  return { ...post, status: 'HIDDEN' };
                }
                return post;
              });
            });
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
            this.posts.update((currentPosts) => {
              return currentPosts.map((post) => {
                if (post.id === postId) {
                  return { ...post, status: 'PUBLISHED' };
                }
                return post;
              });
            });
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
          },
          error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
        });
      }
    });
  }
}
