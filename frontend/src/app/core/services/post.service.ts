import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogPost, CreatePostPayload, UploadResponse } from '../../shared/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private url = 'http://localhost:8080/api/post';

  constructor(private http: HttpClient) {}

  createPost(payload: CreatePostPayload): Observable<BlogPost> {
    return this.http.post<any>(`${this.url}/create`, payload);
  }

  getPost(id: string): Observable<BlogPost>{
    return this.http.get<any>(`${this.url}/${id}`);
  }

  getMyPosts(): Observable<any> {
    return this.http.get<any>(`${this.url}/profile`);
  }

  uploadFiles(files: FormData): Observable<UploadResponse>{
    return this.http.post<any>(`${this.url}/upload`, files);
  }
}