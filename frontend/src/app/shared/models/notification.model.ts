import { NotificationType } from './enums.model';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  formatedCreatedAt: string;
  isRead: boolean;
  link: string;
}
