import express from 'express';
import {
  createRoomCategoryHandler,
  getRoomCategoriesByApartmentHandler,
  getRoomCategoryByIdHandler,
  softDeleteRoomCategoryHandler,
} from '../../controllers/roomCategory.controller.ts';
import { createRoomCategorySchema } from '../../validators/roomCategory.validator.ts';
import { validateRequestBody } from '../../validators/index.ts';
import { extractUserContext, requireUserContext } from '../../middlewares/auth-context.middleware.ts';

const roomCategoryRouter = express.Router({ mergeParams: true });

roomCategoryRouter.use(extractUserContext);

roomCategoryRouter.post(
  '/',
  requireUserContext,
  validateRequestBody(createRoomCategorySchema as any),
  createRoomCategoryHandler
);

roomCategoryRouter.get('/', getRoomCategoriesByApartmentHandler);
roomCategoryRouter.get('/:id', getRoomCategoryByIdHandler);
roomCategoryRouter.delete('/:id', requireUserContext, softDeleteRoomCategoryHandler);

export default roomCategoryRouter;
