export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post';
  title: string;
  message: string;
  createdAt: string;
  formatedCreatedAt: string;
  isRead: boolean;
  link: string;
}
