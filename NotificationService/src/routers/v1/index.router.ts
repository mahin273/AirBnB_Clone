import express from 'express';
import pingRouter from './ping.router.ts';
import healthRouter from './health.router.ts';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/health', healthRouter);

export default v1Router;
