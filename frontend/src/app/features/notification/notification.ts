import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { Notification } from '../../shared/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { ErrorService } from '../../core/services/error.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { ConfirmDialogData } from '../../shared/models/confirm-dialog.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatToolbarModule,
    MatBadgeModule,
    NavbarComponent,
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationsComponent {
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  loading = signal(false);
  hasMoreNotifications = signal(false);

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private errorService: ErrorService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.loading() || !this.hasMoreNotifications()) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollThreshold = document.documentElement.scrollHeight - 300;

    if (scrollPosition >= scrollThreshold) {
      this.loadMoreNotifications();
    }
  }

  loadNotifications() {
    this.loading.set(true);
    this.hasMoreNotifications.set(true);

    this.notificationService.getNotifications('').subscribe({
      next: (notifications) => {
        this.notifications.set(this.formatNotificationsDate(notifications));
        this.hasMoreNotifications.set(notifications.length === 10);
        this.updateCounts();
        this.loading.set(false);
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.loading.set(false);
      },
    });
  }

  loadMoreNotifications() {
    if (this.loading() || !this.hasMoreNotifications()) return;

    this.loading.set(true);

    const lastNotification = this.notifications()[this.notifications().length - 1];
    if (!lastNotification) return;

    this.notificationService.getNotifications(lastNotification.createdAt).subscribe({
      next: (newNotifications) => {
        this.notifications.update((current) => [
          ...current,
          ...this.formatNotificationsDate(newNotifications),
        ]);
        this.hasMoreNotifications.set(newNotifications.length === 10);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorService.handleError(error);
        this.loading.set(false);
      },
    });
  }

  formatNotificationsDate(notifications: Notification[]): Notification[] {
    return notifications.map((n) => {
      return {
        ...n,
        formatedCreatedAt: this.formatTime(n.createdAt),
      };
    });
  }

  updateCounts() {
    const count = this.notifications().filter((n) => !n.isRead).length;
    this.unreadCount.set(count);
    this.notificationService.updateUnreadCount(count);
  }

  formatTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  handleNotificationClick(notification: Notification, event: Event) {
    if (!notification.isRead) {
      this.markAsRead(notification, event);
    }
    this.router.navigate([notification.link]);
  }

  markAsRead(notification: Notification, event: Event) {
    event.stopPropagation();
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.updateCounts();
        },
        error: (error) => this.errorService.handleError(error),
      });
    }
  }

  deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    const wasUnread = !notification.isRead;
    const index = this.notifications().findIndex((n) => n.id === notification.id);
    
    if (index > -1) {
      this.notificationService.delete(notification.id).subscribe({
        next: () => {
          const currentNotifications = this.notifications();
          currentNotifications.splice(index, 1);
          this.notifications.set([...currentNotifications]);
          if (wasUnread) {
            this.notificationService.decrementCount();
          }
          this.updateCounts();
        },
        error: (error) => this.errorService.handleError(error),
      });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const updatedNotifications = this.notifications().map((n) => ({ ...n, isRead: true }));
        this.notifications.set(updatedNotifications);
        this.updateCounts();
      },
      error: (error) => this.errorService.handleError(error),
    });
  }

  clearAll() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: <ConfirmDialogData>{
        title: 'Delete All Notifications',
        message: 'Are you sure you want to delete All notifications?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.deleteAll().subscribe({
          next: () => {
            this.notifications.set([]);
            this.updateCounts();
          },
          error: (error) => this.errorService.handleError(error),
        });
      }
    });
  }
}