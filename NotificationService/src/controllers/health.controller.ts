import type { Request, Response } from 'express';
import { sendResponse } from '../utils/helpers/response.helper.ts';
import { serverConfig } from '../config/index.ts';

export const healthHandler = (_req: Request, res: Response): void => {
  sendResponse(res, 200, 'Server is healthy', {
    uptime: process.uptime(),
    environment: serverConfig.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
};
