import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/user.model';
import { Comment, CreateCommentPayload } from '../../shared/models/post.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private url = 'http://localhost:8080/api/comment';

  constructor(private http: HttpClient) {}

  addComment(createCommentPayload: CreateCommentPayload): Observable<Comment> {
    return this.http.post<any>(`${this.url}/add`, createCommentPayload);
  }

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<any>(`${this.url}/${postId}`);
  }
}
