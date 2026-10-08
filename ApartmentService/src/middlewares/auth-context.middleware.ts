import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors/app.error.ts';

export const extractUserContext = (req: Request, res: Response, next: NextFunction): void => {
  const rawUserId = req.header('X-User-ID');
  const userEmail = req.header('X-User-Email');

  if (rawUserId) {
    const parsedUserId = parseInt(rawUserId, 10);
    if (!Number.isNaN(parsedUserId) && parsedUserId > 0) {
      req.user = {
        id: parsedUserId,
        ...(userEmail ? { email: userEmail } : {}),
      };
    }
  }

  next();
};

export const requireUserContext = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || typeof req.user.id !== 'number' || req.user.id <= 0) {
    throw new UnauthorizedError('Authentication required: Missing or invalid user context header');
  }

  next();
};
