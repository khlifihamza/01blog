export interface CreatePostPayload {
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  files?: String[];
}
export interface MediaItem {
  file: File;
  preview: string;
  type: string;
}

export interface UploadResponse {
  thumbnail: string;
  fileNames: string[];
}

export interface FeedPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    username: string;
    avatar: string;
  };
  createdAt: Date;
  readTime: number;
  likes: number;
  comments: number;
  thumbnail: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    username: string;
    avatar: string;
    bio: string;
    followers: number;
    following: number;
  };
  publishedDate: Date;
  readTime: number;
  likes: number;
  comments: number;
  thumbnail: string;
  isLiked: boolean;
  isBookmarked: boolean;
}
