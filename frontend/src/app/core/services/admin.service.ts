import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, User } from '../../shared/models/user.model';
import { Report, ReportRequest } from '../../shared/models/report.model';
import { Post } from '../../shared/models/post.model';
import { Insights } from '../../shared/models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private url = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getInsights(): Observable<Insights> {
    return this.http.get<Insights>(`${this.url}/get-insights`);
  }

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.url}/get-reports`);
  }

  resolveReport(id: string) {
    return this.http.patch<ApiResponse>(`${this.url}/resolve-report/${id}`, {});
  }

  dismissReport(id: string) {
    return this.http.patch<ApiResponse>(`${this.url}/dismiss-report/${id}`, {});
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/get-users`);
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.url}/get-posts`);
  }

  banUser(username: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/ban-user/${username}`, {});
  }

  unbanUser(username: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/unban-user/${username}`, {});
  }

  deleteUser(username: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/delete-user/${username}`);
  }

  hidePost(id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/hide-post/${id}`, {});
  }

  unhidePost(id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/unhide-post/${id}`, {});
  }

  deletePost(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/delete-post/${id}`);
  }
}
