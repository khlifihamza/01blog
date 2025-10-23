import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../../shared/models/user.model';
import { Notification } from '../../shared/models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private url = 'http://localhost:8080/api/notification';
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(lastCreatedAt: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.url}/get?lastCreatedAt=${lastCreatedAt}`);
  }

  markAsRead(notificationId: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/seen/${notificationId}`, {}).pipe(
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));
      })
    );
  }

  markAllAsRead(): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/seenAll`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  delete(notificationId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/delete/${notificationId}`);
  }

  deleteAll(): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/deleteAll`).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  getUnreadNotificationCount(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`).pipe(
      tap(count => {
        this.unreadCountSubject.next(count);
      })
    );
  }

  updateUnreadCount(count: number) {
    this.unreadCountSubject.next(count);
  }

  decrementCount(amount: number = 1) {
    const currentCount = this.unreadCountSubject.value;
    this.unreadCountSubject.next(Math.max(0, currentCount - amount));
  }
}