import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private url = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  like(postId: string): Observable<ApiResponse> {
    return this.http.get<any>(`${this.url}/like/${postId}`);
  }

  dislike(postId: string): Observable<ApiResponse> {
    return this.http.get<any>(`${this.url}/dislike/${postId}`);
  }
}