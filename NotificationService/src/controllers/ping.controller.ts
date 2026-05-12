import type { Request, Response } from 'express';
import { sendResponse } from '../utils/helpers/response.helper.ts';
import { getPingResponse } from '../services/ping.service.ts';

export const pingHandler = (req: Request, res: Response): void => {
  const rawId = req.params['id'];
  const id = Array.isArray(rawId) ? (rawId[0] ?? 'unknown') : (rawId ?? 'unknown');
  const data = getPingResponse(id);
  sendResponse(res, 200, 'Ping successful', data);
};
