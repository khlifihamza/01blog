import { Component, HostListener, signal, ViewChild, OnDestroy } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FeedUser } from '../models/user.model';
import { ProfileService } from '../../core/services/profile.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { ErrorService } from '../../core/services/error.service';
import { Subscription } from 'rxjs';

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
export class NavbarComponent implements OnDestroy {
  user = signal<FeedUser | null>(null);
  notificationCount = signal(0);
  @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
  breakpoint = 480;
  private notificationSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private profileService: ProfileService,
    private errorService: ErrorService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUser();
    this.loadNotificationCount();
    
    this.notificationSubscription = this.notificationService.unreadCount$.subscribe({
      next: (count) => {
        this.notificationCount.set(count);
      }
    });
  }

  ngOnDestroy() {
    this.notificationSubscription?.unsubscribe();
  }

  loadUser() {
    this.profileService.getUserInfo().subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  loadNotificationCount() {
    this.notificationService.getUnreadNotificationCount().subscribe({
      error: (error) => this.errorService.handleError(error),
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