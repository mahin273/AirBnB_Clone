import express from 'express';
import {
  createApartmentlHandler,
  getAllApartmentsHandler,
  getApartmentByIdHandler,
  getMyApartmentsHandler,
  softDeleteApartmentHandler
} from '../../controllers/apartment.controller.ts';
import { hotelSchema } from '../../validators/hotel.validator.ts';
import { validateRequestBody } from '../../validators/index.ts';
import { extractUserContext, requireUserContext } from '../../middlewares/auth-context.middleware.ts';

const hotelRouter = express.Router();

hotelRouter.use(extractUserContext);

hotelRouter.post(
  '/',
  requireUserContext,
  validateRequestBody(hotelSchema),
  createApartmentlHandler
);
hotelRouter.get('/my-apartments', requireUserContext, getMyApartmentsHandler);
hotelRouter.get('/:id', getApartmentByIdHandler);
hotelRouter.get('/', getAllApartmentsHandler);
hotelRouter.delete('/:id', requireUserContext, softDeleteApartmentHandler);


export default hotelRouter;
