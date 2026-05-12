import express from 'express';
import { healthHandler } from '../../controllers/health.controller.ts';

const healthRouter = express.Router();

healthRouter.get('/', healthHandler);

export default healthRouter;
