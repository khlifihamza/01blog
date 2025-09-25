export interface RegistrationRequest {
  username: String;
  email: String;
  password: String;
  confirmPassword: String;
}

export interface LoginResponse {
  token: String;
  role: String;
}

export interface ApiResponse {
  message: String;
}

export interface LoginRequest {
  identifier: String;
  password: String;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  joinDate: string;
  followers: number;
  following: number;
  posts: number;
  isOwner: boolean;
  isFollowed: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  joinDate: string;
  postsCount: number;
  status: 'ACTIVE' | 'BANNED';
}

export interface FeedUser {
  username: string;
  role: string;
  avatar: string;
}
