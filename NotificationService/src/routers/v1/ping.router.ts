import express from 'express';
import { pingHandler } from '../../controllers/ping.controller.ts';
import { validateRequestParams } from '../../validators/index.ts';
import { pingParamsSchema } from '../../validators/ping.validator.ts';

const pingRouter = express.Router();

pingRouter.get('/:id', validateRequestParams(pingParamsSchema), pingHandler);

export default pingRouter;
