import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedUser, UserProfile } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private url = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) {}

  getProfileDetails(username: string): Observable<UserProfile> {
    return this.http.get<any>(`${this.url}/${username}`);
  }

  getUserInfo(): Observable<FeedUser>{
    return this.http.get<FeedUser>(`${this.url}/me`);
  }
}
