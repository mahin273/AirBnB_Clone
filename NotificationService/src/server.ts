import express from 'express';
import { serverConfig } from './config/index.ts';
import logger from './config/logger.config.ts';
import { attachCorrelationId } from './middlewares/correlation.middleware.ts';
import { genericErrorHandler } from './middlewares/error.middleware.ts';
import { requestLogger } from './middlewares/request-logger.middleware.ts';
import { corsMiddleware, rateLimiter, securityHeaders } from './middlewares/security.middleware.ts';
import v1Router from './routers/v1/index.router.ts';
import v2Router from './routers/v2/index.router.ts';
import { setupMailerWorker } from './processors/email.processor.ts';
import { mailerQueue } from './queues/mailer.queue.ts';
import { addEmailToQueue } from './producers/email.producer.ts';

const app = express();
const PORT = serverConfig.PORT;

// ─── Global Middlewares ──────────────────────────────────────────────
// Order matters: correlation ID → security → logging → body parsers

app.use(attachCorrelationId);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// ─── Error Handler (must be last) ────────────────────────────────────

app.use(genericErrorHandler);

// ─── Start Server ────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${serverConfig.NODE_ENV}`);
  setupMailerWorker();
  logger.info('Mailer worker started');
  logger.info('Redis connection established');

  // sample data to test
  const sample = {
    to: 'md.mahin.bd18@gmail.com',
    subject: 'Test Email',
    templateId: 'welcome',
    params: { name: 'Mahin Khan' },
  };

  addEmailToQueue(sample);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if connections don't close
  setTimeout(() => {
    logger.error('Forced shutdown — connections did not close in time.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
