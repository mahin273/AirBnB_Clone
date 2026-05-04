import type { NextFunction, Request, Response } from "express";
import type { AppError } from "../utils/errors/app.error.ts";
import logger from '../config/logger.ts';

export const genericErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    const stack = err.stack;

    const logPayload = { statusCode, message, method: req.method, path: req.path, stack };
    if (statusCode >= 500) {
      logger.error('Unhandled server error', logPayload);
    } else {
      logger.warn('Client error', logPayload);
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        stack
    });
}
