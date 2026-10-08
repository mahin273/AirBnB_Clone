import express from 'express';
import {
  createRoomHandler,
  getRoomsByApartmentHandler,
  getRoomByIdHandler,
  updateRoomStatusHandler,
  softDeleteRoomHandler,
} from '../../controllers/room.controller.ts';
import {
  createRoomSchema,
  updateRoomStatusSchema,
} from '../../validators/room.validator.ts';
import { validateRequestBody } from '../../validators/index.ts';
import {
  extractUserContext,
  requireUserContext,
} from '../../middlewares/auth-context.middleware.ts';

const roomRouter = express.Router({ mergeParams: true });

roomRouter.use(extractUserContext);

roomRouter.post(
  '/',
  requireUserContext,
  validateRequestBody(createRoomSchema as any),
  createRoomHandler
);

roomRouter.get('/', getRoomsByApartmentHandler);
roomRouter.get('/:id', getRoomByIdHandler);

roomRouter.patch(
  '/:id/status',
  requireUserContext,
  validateRequestBody(updateRoomStatusSchema as any),
  updateRoomStatusHandler
);

roomRouter.delete('/:id', requireUserContext, softDeleteRoomHandler);

export default roomRouter;
