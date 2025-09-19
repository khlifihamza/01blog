import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  private url = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  follow(username: string): Observable<ApiResponse> {
    return this.http.get<any>(`${this.url}/follow/${username}`);
  }

  unfollow(username: string): Observable<ApiResponse> {
    return this.http.get<any>(`${this.url}/unfollow/${username}`);
  }
}
