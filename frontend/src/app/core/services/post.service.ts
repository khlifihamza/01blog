import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePostPayload } from '../../shared/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private url = 'http://localhost:8080/api/post';

  constructor(private http: HttpClient) {}

  createPost(payload: CreatePostPayload): Observable<any> {
    return this.http.post<any>(`${this.url}/create`, payload);
  }

  getMyPosts(): Observable<any> {
    return this.http.get<any>(`${this.url}/profile`);
  }

  uploadFiles(files: FormData): Observable<any>{
    return this.http.post<any>(`${this.url}/upload`, files);
  }
}