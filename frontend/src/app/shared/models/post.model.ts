export interface CreatePostPayload {
  title: string;
  content: string;
  files?: String[];
}
export interface MediaItem {
  file: File;
  preview: string;
  type: string;
}