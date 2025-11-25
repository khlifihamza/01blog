import { ReportStatus } from './enums.model';

export interface ReportRequest {
  reason: string;
  details: string | null;
  reportedUsername: string | null;
  reportedPost: string | null;
}

export interface Report {
  id: string;
  postId: string | null;
  postTitle: string | null;
  reportedUser: string | null;
  reportedBy: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
  formatedCreatedAt: string;
}

export interface ReportData {
  postId: string | null;
  postTitle: string | null;
  username: string | null;
}
