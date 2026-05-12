import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler to catch rejected promises
 * and forward them to Express error handling via next().
 *
 * Express 5 handles async errors natively, but this provides
 * an explicit pattern and safety net.
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.findAll();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
