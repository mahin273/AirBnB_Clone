import express from 'express';
import { createHotelHandler, getHotelByIdHandler } from '../../controllers/hotel.controller.ts';
import { validateRequestBody } from '../../validators/index.ts';
import { hotelSchema } from '../../validators/hotel.validator.ts';
const hotelRouter = express.Router();

hotelRouter.post('/',
  validateRequestBody(hotelSchema),
  createHotelHandler);
hotelRouter.get('/:id', getHotelByIdHandler);

export default hotelRouter
