export interface CreatePostPayload {
  title: string;
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

export interface DetailPost {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatar: string;
    bio: string;
    followers: number;
    following: number;
  };
  publishedDate: string;
  readTime: number;
  likes: number;
  comments: number;
  thumbnail: string;
  isLiked: boolean;
  isBookmarked: boolean;
  isAuthor: boolean;
}

export interface EditPost {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  fileNames: string[];
}

export interface ProfilePost {
  id: string;
  title: string;
  createdAt: string;
  readTime: number;
  likes: number;
  comments: number;
  thumbnail: string;
}