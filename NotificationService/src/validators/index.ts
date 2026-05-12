import type { AnyZodObject } from 'zod/v3';
import type { Request, Response, NextFunction } from 'express';

/**
 * Validates the request body against a Zod schema.
 * @param schema - Zod schema to validate request body
 * @returns Middleware function
 */
export const validateRequestBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid request body',
        error: error,
      });
    }
  };
};

/**
 * Validates the request query parameters against a Zod schema.
 * @param schema - Zod schema to validate query params
 * @returns Middleware function
 */
export const validateRequestQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid request query',
        error: error,
      });
    }
  };
};

/**
 * Validates the request URL parameters against a Zod schema.
 * @param schema - Zod schema to validate URL params
 * @returns Middleware function
 */
export const validateRequestParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid request parameters',
        error: error,
      });
    }
  };
};
