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
  ReportedUser: string | null;
  reportedBy: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}
