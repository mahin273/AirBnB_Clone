import express from 'express';
import { createApartmentlHandler, getAllApartmentsHandler, getApartmentByIdHandler, softDeleteApartmentHandler } from '../../controllers/apartment.controller.ts';
import { hotelSchema } from '../../validators/hotel.validator.ts';
import { validateRequestBody } from '../../validators/index.ts';
const hotelRouter = express.Router();

hotelRouter.post('/',
  validateRequestBody(hotelSchema),
  createApartmentlHandler);
hotelRouter.get('/:id', getApartmentByIdHandler);
hotelRouter.get('/', getAllApartmentsHandler);
hotelRouter.delete('/:id',softDeleteApartmentHandler)

export default hotelRouter
