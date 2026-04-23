import express from 'express';
import { createHotelHandler, getAllHotelsHandler, getHotelByIdHandler } from '../../controllers/hotel.controller.ts';
import { validateRequestBody } from '../../validators/index.ts';
import { hotelSchema } from '../../validators/hotel.validator.ts';
const hotelRouter = express.Router();

hotelRouter.post('/',
  validateRequestBody(hotelSchema),
  createHotelHandler);
hotelRouter.get('/:id', getHotelByIdHandler);
hotelRouter.get('/', getAllHotelsHandler);

export default hotelRouter
