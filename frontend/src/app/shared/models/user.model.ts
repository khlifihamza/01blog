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
  isFollowing: boolean;
}

export interface EditUserProfileResponse {
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
}

export interface AvatarResponse {
  avatar: string;
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

export interface DiscoveryUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  posts: number;
  isOwner: boolean;
  isFollowing: boolean;
}

export interface FeedUser {
  username: string;
  role: string;
  avatar: string;
}
