import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-admin-dashboard',
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
    MatProgressSpinnerModule,
    NavbarComponent,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  insights = signal<Insights | null>(null);
  totalUsers = signal(0);
  totalPosts = signal(0);
  pendingReports = signal(0);
  totalEngagement = signal(0);

  isMobile = signal(false);
  isTablet = signal(false);

  reportColumns = ['post/user', 'reason', 'reportedBy', 'status', 'date', 'actions'];
  userColumns = ['user', 'role', 'posts', 'joinDate', 'status', 'actions'];
  postColumns = ['title', 'author', 'engagement', 'date', 'status', 'actions'];

  reports = signal<Report[]>([]);
  users = signal<User[]>([]);
  posts = signal<Post[]>([]);

  selectedReportStatus = '';
  userSearchQuery = new FormControl('');
  postSearchQuery = new FormControl('');

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
    this.setupSearch();
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 300;

    if (scrollPosition >= scrollThreshold) {
      if (this.activeTabIndex === 1 && this.userSearchQuery.value) {
        if (this.hasMoreUserSearchResults() && !this.isLoadingMoreUserSearch()) {
          this.loadMoreUserSearchResults();
        }
      } else if (this.activeTabIndex === 2 && this.postSearchQuery.value) {
        if (this.hasMorePostSearchResults() && !this.isLoadingMorePostSearch()) {
          this.loadMorePostSearchResults();
        }
      } else {
        if (this.activeTabIndex === 0 && this.hasMoreReports() && !this.isLoadingMoreReports()) {
          this.loadMoreReports();
        } else if (this.activeTabIndex === 1 && this.hasMoreUsers() && !this.isLoadingMoreUsers()) {
          this.loadMoreUsers();
        } else if (this.activeTabIndex === 2 && this.hasMorePosts() && !this.isLoadingMorePosts()) {
          this.loadMorePosts();
        }
      }
    }
  }

  onTabChange(index: number) {
    this.activeTabIndex = index;
  }

  setupSearch() {
    this.userSearchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.hasMoreUserSearchResults.set(true);

        if (searchValue) {
          this.adminService.searchUsers(searchValue.toLowerCase(), '').subscribe({
            next: (users) => {
              this.users.set(this.formatUsersDate(users));
              this.hasMoreUserSearchResults.set(users.length >= 10);
            },
            error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
          });
        } else {
          this.loadUsers();
        }
      });

    this.postSearchQuery.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.isLoadingMorePostSearch.set(true);

        if (searchValue) {
          this.adminService.searchPosts(searchValue.toLowerCase(), '').subscribe({
            next: (posts) => {
              this.posts.set(this.formatPostsDate(posts));
              this.hasMorePostSearchResults.set(posts.length === 10);
              this.isLoadingMorePostSearch.set(false);
            },
            error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
          });
        } else {
          this.loadPosts();
        }
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
    this.adminService.getReports(this.selectedReportStatus, '').subscribe({
      next: (reports) => {
        this.reports.set(this.formatReportsDate(reports));
        this.hasMoreReports.set(reports.length >= 10);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadUsers() {
    this.adminService.getUsers('').subscribe({
      next: (users) => {
        this.users.set(this.formatUsersDate(users));
        this.hasMoreUsers.set(users.length >= 10);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadPosts() {
    this.adminService.getPosts('').subscribe({
      next: (posts) => {
        this.posts.set(this.formatPostsDate(posts));
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
          ...this.formatReportsDate(newReports),
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
    if (this.isLoadingMoreUsers() || !this.hasMoreUsers()) return;

    this.isLoadingMoreUsers.set(true);

    const lastUser = this.users()[this.users().length - 1];
    if (!lastUser) return;

    this.adminService.getUsers(lastUser.joinDate).subscribe({
      next: (newUsers) => {
        this.users.update((currentUsers) => [...currentUsers, ...this.formatUsersDate(newUsers)]);
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
    if (this.isLoadingMorePosts() || !this.hasMorePosts()) return;

    this.isLoadingMorePosts.set(true);

    const lastPost = this.posts()[this.posts().length - 1];
    if (!lastPost) return;

    this.adminService.getPosts(lastPost.publishedDate).subscribe({
      next: (newPosts) => {
        this.posts.update((currentPosts) => [...currentPosts, ...this.formatPostsDate(newPosts)]);
        this.hasMorePosts.set(newPosts.length === 10);
        this.isLoadingMorePosts.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Close', { duration: 5000 });
        this.isLoadingMorePosts.set(false);
      },
    });
  }

  formatReportsDate(reports: Report[]): Report[] {
    return reports.map((r) => {
      return {
        ...r,
        formatedCreatedAt: this.formatDate(r.createdAt),
      };
    });
  }

  formatPostsDate(posts: Post[]): Post[] {
    return posts.map((p) => {
      return {
        ...p,
        formatedPublishedDate: this.formatDate(p.publishedDate),
      };
    });
  }

  formatUsersDate(user: User[]): User[] {
    return user.map((u) => {
      return {
        ...u,
        formatedJoinDate: this.formatDate(u.joinDate),
      };
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }

  filterReports() {
    this.loadReports();
  }

  loadMoreUserSearchResults() {
    if (
      this.isLoadingMoreUserSearch() ||
      !this.hasMoreUserSearchResults() ||
      !this.userSearchQuery.value
    )
      return;

    this.isLoadingMoreUserSearch.set(true);

    const lastUser = this.users()[this.users().length - 1];
    if (!lastUser) return;

    this.adminService
      .searchUsers(this.userSearchQuery.value.toLowerCase(), lastUser.joinDate)
      .subscribe({
        next: (newUsers) => {
          this.users.update((currentUsers) => [...currentUsers, ...this.formatUsersDate(newUsers)]);
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
      !this.postSearchQuery.value
    )
      return;

    this.isLoadingMorePostSearch.set(true);

    const lastPost = this.posts()[this.posts().length - 1];
    if (!lastPost) return;

    this.adminService
      .searchPosts(this.postSearchQuery.value.toLowerCase(), lastPost.publishedDate)
      .subscribe({
        next: (newPosts) => {
          this.posts.update((currentPosts) => [...currentPosts, ...this.formatPostsDate(newPosts)]);
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
        report.status = 'RESOLVED';
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
            report.status = 'PENDING';
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
        report.status = 'DISMISSED';
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
            report.status = 'PENDING';
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
