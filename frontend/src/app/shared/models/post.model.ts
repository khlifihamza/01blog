export interface CreatePostPayload {
  title: string;
  content: string;
  mediaFiles?: string;
}
export interface MediaItem {
  file: File;
  preview: string;
  type: string;
}