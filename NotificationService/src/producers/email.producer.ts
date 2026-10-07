import type { NotificationDto } from '../dto/notification.dto.ts';
import { mailerQueue } from '../queues/mailer.queue.ts';
import logger from '../config/logger.config.ts';

export const MAILER_PAYLOAD = 'payload:mail';

export const addEmailToQueue = async (payload: NotificationDto) => {
  await mailerQueue.add(MAILER_PAYLOAD, payload, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  });
  logger.info(`Email added to queue ${JSON.stringify(payload)}`);
};

