import type { NextFunction, Request, Response } from 'express';
import { serverConfig } from '../config/index.ts';
import logger from '../config/logger.config.ts';
import { AppError } from '../utils/errors/app.error.ts';

export const genericErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Wrap unexpected errors as AppError
  const appError =
    err instanceof AppError ? err : new AppError(500, err.message || 'Internal Server Error');

  // Log the error with full stack
  logger.error(appError.message, {
    statusCode: appError.statusCode,
    stack: appError.stack,
    originalError: !(err instanceof AppError) ? err.stack : undefined,
  });

  const response: Record<string, unknown> = {
    success: false,
    statusCode: appError.statusCode,
    message: appError.message,
  };

  // Only include stack trace in non-production environments
  if (serverConfig.NODE_ENV !== 'production') {
    response['stack'] = appError.stack;
  }

  return res.status(appError.statusCode).json(response);
};
