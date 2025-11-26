export enum ReportStatus {
  RESOLVED = 'RESOLVED',
  PENDING = 'PENDING',
  DISMISSED = 'DISMISSED'
}

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  POST = 'POST'
}

export enum PostType {
  IMAGE = 'image',
  VIDEO = 'video'
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  OTHER = 'other'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}
