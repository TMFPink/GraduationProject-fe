export interface ApiResponse<T> {
  statusCode: number | string;
  metadata?: T;
}

export interface ErrorResponse {
  statusCode: string;
  code: number;
  message: string;
}
