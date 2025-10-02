import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { Notification } from '../../shared/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
    MatToolbarModule,
    MatBadgeModule,
    NavbarComponent,
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class NotificationsComponent implements OnInit {
  allNotifications = signal<Notification[]>([]);
  unreadNotifications: Notification[] = [];
  unreadCount = signal(0);

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.allNotifications.set(notifications);
        this.updateFilteredNotifications();
        this.updateCounts();
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  updateFilteredNotifications() {
    this.unreadNotifications = this.allNotifications().filter((n) => !n.isRead);
  }

  updateCounts() {
    const count = this.allNotifications().filter((n) => !n.isRead).length;
    this.unreadCount.set(count);
  }

  getNotificationIcon(type: string): string {
    const icons = {
      like: 'favorite',
      comment: 'comment',
      follow: 'person_add',
      post: 'article',
    };
    return icons[type as keyof typeof icons] || 'notifications';
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

  handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      notification.isRead = true;
      this.updateFilteredNotifications();
      this.updateCounts();
    }
    this.router.navigate([notification.link]);
  }

  markAsRead(notification: Notification, event: Event) {
    event.stopPropagation();
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = !notification.isRead;
          this.updateFilteredNotifications();
          this.updateCounts();
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    }
  }

  deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    const index = this.allNotifications().findIndex((n) => n.id === notification.id);
    if (index > -1) {
      this.notificationService.delete(notification.id).subscribe({
        next: () => {
          this.allNotifications().splice(index, 1);
          this.updateFilteredNotifications();
          this.updateCounts();
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.allNotifications().forEach((n) => (n.isRead = true));
        this.updateFilteredNotifications();
        this.updateCounts();
      },
      error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
    });
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.deleteAll().subscribe({
        next: () => {
          this.allNotifications.set([]);
          this.updateFilteredNotifications();
          this.updateCounts();
        },
        error: (error) => this.snackBar.open(error.message, 'Close', { duration: 5000 }),
      });
    }
  }
}
