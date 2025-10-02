import { Component, HostListener, OnInit, signal, ViewChild } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FeedUser } from '../models/user.model';
import { ProfileService } from '../../core/services/profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatBadgeModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent implements OnInit {
  user = signal<FeedUser | null>(null);
  notificationCount = signal(0);
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  breakpoint = 480;

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUser();
    this.loadNotificationCount();
  }

  loadUser() {
    this.profileService.getUserInfo().subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  loadNotificationCount() {
    this.notificationService.getUnreadNotificationCount().subscribe({
      next: (count) => {
        this.notificationCount.set(count);
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > this.breakpoint && this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
  }

  isAdmin() {
    return this.user()?.role == 'ADMIN';
  }

  viewProfile() {
    this.router.navigate(['/profile', this.user()!.username]);
  }

  openAdminDashboard() {
    this.router.navigate(['/admin']);
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  openExplore() {
    this.router.navigate(['/discovery']);
  }

  writeStory() {
    this.router.navigate(['/post/create']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
