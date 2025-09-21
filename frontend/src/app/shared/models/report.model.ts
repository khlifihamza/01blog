export interface ReportRequest {
  reason: string;
  details: string | null;
  reportedUsername: string | null;
  reportedPost: string | null;
}
