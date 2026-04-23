import express from 'express';
import { createHotelHandler, getAllHotelsHandler, getHotelByIdHandler, softDeleteHotelHandler } from '../../controllers/hotel.controller.ts';
import { hotelSchema } from '../../validators/hotel.validator.ts';
import { validateRequestBody } from '../../validators/index.ts';
const hotelRouter = express.Router();

hotelRouter.post('/',
  validateRequestBody(hotelSchema),
  createHotelHandler);
hotelRouter.get('/:id', getHotelByIdHandler);
hotelRouter.get('/', getAllHotelsHandler);
hotelRouter.delete('/:id',softDeleteHotelHandler)

export default hotelRouter
