import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DetailPost,
  CreatePostPayload,
  UploadResponse,
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

  createPost(payload: CreatePostPayload): Observable<any> {
    return this.http.post<any>(`${this.url}/create`, payload);
  }

  updatePost(payload: CreatePostPayload, id: string): Observable<any> {
    return this.http.patch<any>(`${this.url}/update/${id}`, payload);
  }

  getPost(id: string): Observable<DetailPost> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  getPostToEdit(id: string): Observable<EditPost> {
    return this.http.get<any>(`${this.url}/edit/${id}`);
  }

  getPosts(username: string): Observable<ProfilePost[]> {
    return this.http.get<any>(`${this.url}/profile/${username}`);
  }

  getFeedPosts(): Observable<FeedPost[]> {
    return this.http.get<any>(`${this.url}/feed`);
  }

  uploadFiles(files: FormData): Observable<UploadResponse> {
    return this.http.post<any>(`${this.url}/upload`, files);
  }

  deletePost(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/delete/${id}`);
  }

  getOldThumbnail(filename: string): Observable<Blob> {
    return this.http.get(`${this.url}/file/${filename}`, { responseType: 'blob' });
  }
}
