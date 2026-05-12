import type { NextFunction, Request, Response } from 'express';
import logger from '../config/logger.config.ts';

/**
 * Logs every incoming request with method, URL, status code, and response time.
 * Inherits the correlation ID automatically via the Winston logger.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} — ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });

  next();
};
