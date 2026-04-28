import type { Request,Response,NextFunction } from 'express';
import {v4 as uuidV4} from "uuid"
import { asyncLocalStorage } from '../utils/helpers/request.helper.ts';

export const attachCorrelationId = (req:Request,res:Response,next:NextFunction)=>{
  const correlationId = uuidV4();
  req.headers['X-Correlation-Id'] = correlationId;

 asyncLocalStorage.run({correlationId:correlationId},()=>{
  next();
 })

}
