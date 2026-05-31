export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function success<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}
