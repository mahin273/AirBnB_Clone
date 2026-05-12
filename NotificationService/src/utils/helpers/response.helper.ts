import type { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

/**
 * Sends a standardized JSON response.
 * Enforces a consistent envelope across all endpoints.
 *
 * @example
 * sendResponse(res, 200, 'User fetched successfully', { id: 1, name: 'John' });
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): void => {
  const response: ApiResponse<T> = {
    success: statusCode < 400,
    statusCode,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};
