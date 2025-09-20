export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link: string;
}