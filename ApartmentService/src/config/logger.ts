import winston from 'winston'
import { getCorrelationId } from '../utils/helpers/request.helper.ts';
import DailyRotateFile from 'winston-daily-rotate-file';
const logger = winston.createLogger({
 format: winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  winston.format.json(),
  winston.format.printf(({timestamp,level,message,...data})=>{
    const output = {
      timestamp,
      level,
      message,
      correlationId:getCorrelationId(),
      data
    }
    return JSON.stringify(output)
  })
 ),
 transports: [
  new winston.transports.Console(),
  new DailyRotateFile({
    filename: 'logs/server-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d'
  })
  //Todo: add those logs in mongodb 
 ]


});



export default logger;
