import type { NextFunction, Request, Response } from "express";
import type { AppError } from "../utils/errors/app.error.ts";

export const genericErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    const stack = err.stack;
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        stack
    });
}
