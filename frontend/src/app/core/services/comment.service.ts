import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CreateCommentPayload } from '../../shared/models/post.model';
import { ApiResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private url = 'http://localhost:8080/api/comment';

  constructor(private http: HttpClient) {}

  addComment(createCommentPayload: CreateCommentPayload): Observable<Comment> {
    return this.http.post<Comment>(`${this.url}/add`, createCommentPayload);
  }

  deleteComment(commentId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.url}/delete/${commentId}`);
  }

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.url}/${postId}`);
  }
}
