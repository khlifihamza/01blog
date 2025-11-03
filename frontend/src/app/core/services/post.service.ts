import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DetailPost,
  EditPost,
  ProfilePost,
  FeedPost,
} from '../../shared/models/post.model';
import { ApiResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private url = 'http://localhost:8080/api/post';

  constructor(private http: HttpClient) {}

  createPost(payload: FormData): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/create`, payload);
  }

  updatePost(payload: FormData, id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/update/${id}`, payload);
  }

  getPost(id: string): Observable<DetailPost> {
    return this.http.get<DetailPost>(`${this.url}/${id}`);
  }

  getPostToEdit(id: string): Observable<EditPost> {
    return this.http.get<EditPost>(`${this.url}/edit/${id}`);
  }

  getProfilePosts(username: string, lastCreatedAt: string): Observable<ProfilePost[]> {
    return this.http.get<ProfilePost[]>(`${this.url}/profile/${username}?lastCreatedAt=${lastCreatedAt}`);
  }

  getFeedPosts(lastCreatedAt?: string): Observable<FeedPost[]> {
    let params = new HttpParams();
    if (lastCreatedAt) {
      params = params.set('lastCreatedAt', lastCreatedAt);
    }
    return this.http.get<FeedPost[]>(`${this.url}/feed`, { params });
  }

  deletePost(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/delete/${id}`);
  }

  getOldThumbnail(filename: string): Observable<Blob> {
    return this.http.get(`${this.url}/file/${filename}`, { responseType: 'blob' });
  }
}
