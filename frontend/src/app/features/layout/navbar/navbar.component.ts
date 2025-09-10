// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatBadgeModule } from '@angular/material/badge';
// import { MatDividerModule } from '@angular/material/divider';
// import { Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { AuthService } from '../../../core/services/auth.service';
// // import { NotificationService } from '../../../core/services/notification.service';
// // import { User } from '../../../shared/models/user.model';

// @Component({
//   selector: 'app-navbar',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     RouterModule,
//     MatToolbarModule,
//     MatButtonModule,
//     MatIconModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatMenuModule,
//     MatBadgeModule,
//     MatDividerModule
//   ],
//   template: `
//     <mat-toolbar class="navbar">
//       <div class="navbar-content">
//         <!-- Logo and Brand -->
//         <div class="navbar-brand" routerLink="/feed" [class.pulse]="false">
//           <mat-icon class="brand-icon">school</mat-icon>
//           <span class="brand-text text-gradient">01Blog</span>
//         </div>

//         <!-- Search Bar -->
//         <div class="navbar-search fade-in" *ngIf="currentUser">
//           <mat-form-field appearance="outline" class="search-field">
//             <mat-label>Search users, posts...</mat-label>
//             <input matInput placeholder="Search..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
//             <mat-icon matSuffix>search</mat-icon>
//           </mat-form-field>
//         </div>

//         <!-- Navigation Links and User Menu -->
//         <div class="navbar-actions slide-in-right" *ngIf="currentUser">
//           <!-- Navigation Links -->
//           <div class="nav-links">
//             <button mat-button routerLink="/feed" routerLinkActive="active">
//               <mat-icon>home</mat-icon>
//               <span>Feed</span>
//             </button>
//             <button mat-button [routerLink]="'/profile/' + currentUser.username" routerLinkActive="active">
//               <mat-icon>person</mat-icon>
//               <span>Profile</span>
//             </button>
//             <button mat-button routerLink="/admin" routerLinkActive="active" *ngIf="isAdmin">
//               <mat-icon>admin_panel_settings</mat-icon>
//               <span>Admin</span>
//             </button>
//           </div>

//           <!-- Notifications -->
//           <button mat-icon-button [matMenuTriggerFor]="notificationMenu" class="notification-button hover-lift">
//             <mat-icon [matBadge]="unreadCount$ | async" 
//                       [matBadgeHidden]="(unreadCount$ | async) === 0"
//                       matBadgeColor="accent" 
//                       matBadgeSize="small">
//               notifications
//             </mat-icon>
//           </button>

//           <!-- User Menu -->
//           <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-button hover-lift">
//             <div class="user-avatar">
//               <img [src]="currentUser.avatar" [alt]="currentUser.firstName">
//             </div>
//             <span class="user-name">{{ currentUser.firstName }}</span>
//             <mat-icon>expand_more</mat-icon>
//           </button>
//         </div>

//         <!-- Login Button for Guests -->
//         <div class="guest-actions" *ngIf="!currentUser">
//           <button mat-button routerLink="/auth/login">Login</button>
//           <button mat-raised-button color="accent" routerLink="/auth/register">Sign Up</button>
//         </div>
//       </div>
//     </mat-toolbar>

//     <!-- Notification Menu -->
//     <mat-menu #notificationMenu="matMenu" class="notification-menu">
//       <div class="notification-header">
//         <h3>Notifications</h3>
//         <button mat-button (click)="markAllAsRead()" *ngIf="(unreadCount$ | async)! > 0">
//           Mark all read
//         </button>
//       </div>
      
//       <div class="notification-list" *ngIf="(notifications$ | async)?.length! > 0; else noNotifications">
//         <div *ngFor="let notification of (notifications$ | async)?.slice(0, 5)" 
//              class="notification-item" 
//              [class.unread]="!notification.isRead"
//              (click)="markAsRead(notification.id)">
//           <div class="notification-content">
//             <div class="notification-message">{{ notification.message }}</div>
//             <div class="notification-time">{{ notification.createdAt | date:'short' }}</div>
//           </div>
//           <mat-icon class="notification-icon" *ngIf="!notification.isRead">fiber_manual_record</mat-icon>
//         </div>
//       </div>
      
//       <ng-template #noNotifications>
//         <div class="no-notifications">
//           <mat-icon>notifications_none</mat-icon>
//           <p>No notifications yet</p>
//         </div>
//       </ng-template>
      
//       <mat-divider></mat-divider>
//       <button mat-menu-item routerLink="/notifications">
//         <mat-icon>list</mat-icon>
//         <span>View all notifications</span>
//       </button>
//     </mat-menu>

//     <!-- User Menu -->
//     <mat-menu #userMenu="matMenu">
//       <div class="user-menu-header">
//         <div class="user-info">
//           <img [src]="currentUser?.avatar" [alt]="currentUser?.firstName" class="user-menu-avatar">
//           <div>
//             <div class="user-menu-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
//             <div class="user-menu-username">{{ currentUser?.username }}</div>
//           </div>
//         </div>
//       </div>
      
//       <mat-divider></mat-divider>
      
//       <button mat-menu-item [routerLink]="'/profile/' + currentUser?.username">
//         <mat-icon>person</mat-icon>
//         <span>My Profile</span>
//       </button>
      
//       <button mat-menu-item>
//         <mat-icon>settings</mat-icon>
//         <span>Settings</span>
//       </button>
      
//       <button mat-menu-item>
//         <mat-icon>help</mat-icon>
//         <span>Help & Support</span>
//       </button>
      
//       <mat-divider></mat-divider>
      
//       <button mat-menu-item (click)="logout()" class="logout-button">
//         <mat-icon>logout</mat-icon>
//         <span>Sign Out</span>
//       </button>
//     </mat-menu>
//   `,
//   styles: [`
//     .navbar {
//       position: sticky;
//       top: 0;
//       z-index: 1000;
//       background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 50%, var(--primary-800) 100%);
//       box-shadow: var(--shadow-lg);
//       backdrop-filter: blur(10px);
//       border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//     }

//     .navbar-content {
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       width: 100%;
//       max-width: 1200px;
//       margin: 0 auto;
//       padding: 0 16px;
//     }

//     .navbar-brand {
//       display: flex;
//       align-items: center;
//       gap: var(--spacing-sm);
//       cursor: pointer;
//       color: white;
//       text-decoration: none;
//       font-weight: 800;
//       font-size: 24px;
//       transition: all 0.3s ease;
//       padding: var(--spacing-sm);
//       border-radius: var(--radius-lg);
//     }

//     .navbar-brand:hover {
//       background: rgba(255, 255, 255, 0.1);
//       transform: scale(1.05);
//     }

//     .brand-icon {
//       font-size: 32px;
//       filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
//     }

//     .brand-text {
//       font-weight: 800;
//       letter-spacing: -0.5px;
//     }

//     .navbar-search {
//       flex: 1;
//       max-width: 500px;
//       margin: 0 var(--spacing-xl);
//     }

//     .search-field {
//       width: 100%;
//     }

//     .search-field .mat-form-field-wrapper {
//       background-color: rgba(255,255,255,0.15);
//       border-radius: var(--radius-xl);
//       backdrop-filter: blur(10px);
//       transition: all 0.3s ease;
//     }

//     .search-field:hover .mat-form-field-wrapper {
//       background-color: rgba(255,255,255,0.2);
//     }

//     .search-field .mat-form-field-outline {
//       color: rgba(255,255,255,0.3);
//     }

//     .search-field .mat-form-field-label,
//     .search-field .mat-form-field-infix input {
//       color: white;
//     }

//     .navbar-actions {
//       display: flex;
//       align-items: center;
//       gap: var(--spacing-md);
//     }

//     .nav-links {
//       display: flex;
//       gap: var(--spacing-sm);
//     }

//     .nav-links button {
//       color: rgba(255,255,255,0.8);
//       display: flex;
//       align-items: center;
//       gap: var(--spacing-xs);
//       font-size: 13px;
//       font-weight: 500;
//       padding: var(--spacing-sm) var(--spacing-md);
//       border-radius: var(--radius-lg);
//       transition: all 0.3s ease;
//       position: relative;
//       overflow: hidden;
//     }

//     .nav-links button::before {
//       content: '';
//       position: absolute;
//       top: 0;
//       left: -100%;
//       width: 100%;
//       height: 100%;
//       background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
//       transition: left 0.5s;
//     }

//     .nav-links button:hover::before {
//       left: 100%;
//     }

//     .nav-links button.active,
//     .nav-links button:hover {
//       color: white;
//       background-color: rgba(255,255,255,0.15);
//       transform: translateY(-1px);
//       box-shadow: var(--shadow-md);
//     }

//     .notification-button {
//       color: white;
//       transition: all 0.3s ease;
//       border-radius: var(--radius-lg);
//     }

//     .notification-button:hover {
//       background: rgba(255,255,255,0.1);
//       transform: scale(1.1);
//     }

//     .user-menu-button {
//       display: flex;
//       align-items: center;
//       gap: var(--spacing-sm);
//       color: white;
//       padding: var(--spacing-sm) var(--spacing-md);
//       border-radius: var(--radius-xl);
//       transition: all 0.3s ease;
//       border: 1px solid rgba(255,255,255,0.1);
//     }

//     .user-menu-button:hover {
//       background-color: rgba(255,255,255,0.15);
//       border-color: rgba(255,255,255,0.2);
//       transform: translateY(-1px);
//       box-shadow: var(--shadow-md);
//     }

//     .user-avatar img,
//     .user-menu-avatar {
//       width: 36px;
//       height: 36px;
//       border-radius: var(--radius-full);
//       object-fit: cover;
//       border: 2px solid rgba(255,255,255,0.2);
//       transition: all 0.3s ease;
//     }

//     .user-menu-button:hover .user-avatar img {
//       border-color: rgba(255,255,255,0.4);
//       transform: scale(1.05);
//     }

//     .user-name {
//       font-size: 13px;
//       font-weight: 600;
//       letter-spacing: 0.25px;
//     }

//     .guest-actions {
//       display: flex;
//       gap: var(--spacing-md);
//       align-items: center;
//     }

//     .guest-actions button {
//       color: white;
//       font-weight: 500;
//       padding: var(--spacing-sm) var(--spacing-lg);
//       border-radius: var(--radius-lg);
//       transition: all 0.3s ease;
//     }

//     .guest-actions button:hover {
//       background: rgba(255,255,255,0.1);
//       transform: translateY(-1px);
//     }

//     /* Notification Menu Styles */
//     .notification-menu {
//       width: 380px;
//       max-height: 400px;
//       border-radius: var(--radius-xl);
//       box-shadow: var(--shadow-xl);
//       border: 1px solid var(--neutral-200);
//       overflow: hidden;
//     }

//     .notification-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding: var(--spacing-lg);
//       border-bottom: 1px solid var(--neutral-200);
//       background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
//     }

//     .notification-header h3 {
//       margin: 0;
//       font-size: 18px;
//       font-weight: 700;
//       color: var(--primary-800);
//     }

//     .notification-list {
//       max-height: 300px;
//       overflow-y: auto;
//     }

//     .notification-item {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding: var(--spacing-md) var(--spacing-lg);
//       cursor: pointer;
//       transition: all 0.3s ease;
//       border-bottom: 1px solid var(--neutral-100);
//     }

//     .notification-item:hover {
//       background-color: var(--primary-50);
//       transform: translateX(4px);
//     }

//     .notification-item.unread {
//       background-color: var(--primary-100);
//       border-left: 4px solid var(--primary-500);
//     }

//     .notification-content {
//       flex: 1;
//     }

//     .notification-message {
//       font-size: 13px;
//       line-height: 1.4;
//       margin-bottom: var(--spacing-xs);
//       font-weight: 500;
//       color: var(--neutral-800);
//     }

//     .notification-time {
//       font-size: 12px;
//       color: var(--neutral-600);
//       font-weight: 400;
//     }

//     .notification-icon {
//       color: var(--primary-500);
//       font-size: 8px;
//       animation: pulse 2s infinite;
//     }

//     .no-notifications {
//       text-align: center;
//       padding: var(--spacing-2xl) var(--spacing-lg);
//       color: var(--neutral-600);
//     }

//     .no-notifications mat-icon {
//       font-size: 48px;
//       margin-bottom: var(--spacing-sm);
//       color: var(--neutral-400);
//     }

//     /* User Menu Styles */
//     .user-menu-header {
//       padding: var(--spacing-lg);
//       border-bottom: 1px solid var(--neutral-200);
//       background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
//     }

//     .user-info {
//       display: flex;
//       gap: var(--spacing-md);
//       align-items: center;
//     }

//     .user-menu-name {
//       font-weight: 700;
//       font-size: 15px;
//       color: var(--neutral-800);
//     }

//     .user-menu-username {
//       font-size: 12px;
//       color: var(--neutral-600);
//       font-weight: 500;
//     }

//     .logout-button {
//       color: var(--error-600);
//       font-weight: 500;
//     }

//     .logout-button:hover {
//       background: var(--error-50);
//     }

//     /* Responsive Design */
//     @media (max-width: 768px) {
//       .navbar-search {
//         display: none;
//       }
      
//       .nav-links span {
//         display: none;
//       }
      
//       .nav-links button {
//         min-width: 40px;
//         padding: var(--spacing-sm);
//       }
      
//       .user-name {
//         display: none;
//       }
      
//       .notification-menu {
//         width: 90vw;
//         max-width: 380px;
//       }
//     }

//     @media (max-width: 480px) {
//       .navbar-content {
//         padding: 0 var(--spacing-sm);
//       }
      
//       .navbar-actions {
//         gap: var(--spacing-sm);
//       }
      
//       .brand-text {
//         display: none;
//       }
      
//       .user-name {
//         display: none;
//       }
//     }
//   `]
// })
// export class NavbarComponent implements OnInit {
// //   currentUser: User | null = null;
//   isAdmin = false;
//   searchQuery = '';
// //   notifications$: Observable<any[]>;
// //   unreadCount$: Observable<number>;

//   constructor(
//     private authService: AuthService,
//     // private notificationService: NotificationService,
//     private router: Router
//   ) {
//     // this.notifications$ = this.notificationService.notifications$;
//     // this.unreadCount$ = this.notificationService.unreadCount$;
//   }

//   ngOnInit(): void {
//     // this.authService.currentUser$.subscribe(user => {
//     //   this.currentUser = user;
//     //   this.isAdmin = this.authService.isAdmin();
//     // });
//   }

//   onSearch(): void {
//     if (this.searchQuery.trim()) {
//       this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
//     }
//   }

//   markAsRead(notificationId: string): void {
//     // this.notificationService.markAsRead(notificationId).subscribe();
//   }

//   markAllAsRead(): void {
//     // this.notificationService.markAllAsRead().subscribe();
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/auth/login']);
//   }
// }