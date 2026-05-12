import type { NotificationDto } from '../dto/notification.dto.ts';
import { mailerQueue } from '../queues/mailer.queue.ts';
import logger from '../config/logger.config.ts';

export const MAILER_PAYLOAD = 'payload:mail';

export const addEmailToQueue = async (payload: NotificationDto) => {
  await mailerQueue.add(MAILER_PAYLOAD, payload);
  logger.info(`Email added to queue ${JSON.stringify(payload)}`);
};
