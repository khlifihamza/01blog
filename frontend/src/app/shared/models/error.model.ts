export interface ApiError {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
  details?: { [key: string]: string };
}

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorState {
  show: boolean;
  message: string;
  type: ErrorType;
  details?: { [key: string]: string };
}