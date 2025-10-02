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

  follow(username: string, action: string): Observable<ApiResponse> {
    return this.http.get<any>(`${this.url}/${action}/${username}`);
  }
}
