import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidV4 } from "uuid";
import { asyncLocalStorage } from '../utils/helpers/request.helper.ts';

export const attachCorrelationId = (req: Request, res: Response, next: NextFunction) => {
  const incomingId = req.header('x-correlation-id');
  const correlationId = incomingId && incomingId.trim() !== '' ? incomingId : uuidV4();

  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  asyncLocalStorage.run({ correlationId }, () => {
    next();
  });
};
