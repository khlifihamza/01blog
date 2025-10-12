export interface CreatePostPayload {
  title: string;
  content: string;
  thumbnail: string;
  files?: String[];
}
export interface MediaItem {
  id: string;
  position: number;
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
    avatar: string | null;
  };
  createdAt: string;
  likes: number;
  comments: number;
  thumbnail: string;
  readTime: number | 0;
}

export interface DetailPost {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatar: string | null;
    bio: string | null;
    followers: number;
    following: number;
    isFollowed: boolean;
  };
  publishedDate: string;
  likes: number;
  comments: number;
  thumbnail: string;
  isLiked: boolean;
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
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  thumbnail: string;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
  likes: number;
  comments: number;
  status: 'PUBLISHED' | 'HIDDEN';
}

export interface DiscoveryPost {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    avatar: string;
  };
  publishedDate: string;
  likes: number;
  comments: number;
  thumbnail: string;
  readTime: number | 0;
}
export interface Comment {
  id: string;
  username: string;
  avatar: string | null;
  createAt: string;
  content: string;
  isOwner: boolean;
}

export interface CreateCommentPayload {
  postId: string;
  content: string;
}
