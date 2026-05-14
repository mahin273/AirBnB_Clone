import { Worker } from 'bullmq';
import type { NotificationDto } from '../dto/notification.dto.ts';
import { MAILER_QUEUE } from '../queues/mailer.queue.ts';
import { getRedisConnection } from '../config/redis.config.ts';
import logger from '../config/logger.config.ts';
import { MAILER_PAYLOAD } from '../producers/email.producer.ts';
import { InvalidJobError } from '../utils/errors/app.error.ts';
import { renderMailTemplate } from '../templates/templates.handler.ts';
import { sendEmail } from '../services/mailer.service.ts';

export const setupMailerWorker = () => {
  const emailProcessor = new Worker<NotificationDto>(
    MAILER_QUEUE,
    async (job) => {
      if (job.name !== MAILER_PAYLOAD) {
        throw new InvalidJobError('Invalid job name');
      }

      const payload = job.data;
      const emailContent = await renderMailTemplate(payload.templateId,payload.params);
      await sendEmail(payload.to,payload.subject,emailContent);
      logger.info(`Email sent to ${payload.to} with subject ${payload.subject}`);
      
      
    },
    {
      connection: getRedisConnection(),
    },
  );

  emailProcessor.on('failed', (job, error) => {
    logger.info(`Email Processing Failed ${job?.id}`);
    logger.error('error', error);
  });

  emailProcessor.on('completed', (job) => {
    logger.info(`Email Processing Completed ${job.id}`);
  });
};
