import express from 'express';
import { pingHandler } from '../../controllers/ping.controller.ts';
import { validateRequestBody } from '../../validators/index.ts';
import { pingSchema } from '../../validators/ping.validator.ts';
const pingRouter = express.Router();

pingRouter.get('/:id',validateRequestBody(pingSchema as any), pingHandler);

export default pingRouter