import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  EditUserProfileResponse,
  FeedUser,
  UserProfile,
} from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private url = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) {}

  getProfileDetails(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.url}/${username}`);
  }

  getEditProfileDetails(): Observable<EditUserProfileResponse> {
    return this.http.get<EditUserProfileResponse>(`${this.url}/edit-data`);
  }

  EditProfileDetails(data: FormData): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.url}/save-data`, data);
  }

  getUserInfo(): Observable<FeedUser> {
    return this.http.get<FeedUser>(`${this.url}/me`);
  }
}
