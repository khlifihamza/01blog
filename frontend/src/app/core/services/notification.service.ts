import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/user.model';
import { Notification } from '../../shared/models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private url = 'http://localhost:8080/api/notification';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.url}/get`);
  }

  markAsRead(notificationId: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/seen/${notificationId}`, {});
  }

  markAllAsRead(): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/seenAll`, {});
  }

  delete(notificationId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/delete/${notificationId}`);
  }

  deleteAll(): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/deleteAll`);
  }

  getUnreadNotificationCount(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`);
  }
}
