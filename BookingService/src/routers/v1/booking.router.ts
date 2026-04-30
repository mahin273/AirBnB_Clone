import express from 'express';
import { validateRequestBody } from '../../validators/index.ts';
import { CreateBookingSchema } from '../../validators/booking.validator.ts';
import { createBookingController,confirmBookingController } from '../../controllers/booking.controller.ts';

const bookingRouter = express.Router();

bookingRouter.post('/',validateRequestBody(CreateBookingSchema as any), createBookingController);

bookingRouter.post('/confirm',confirmBookingController);
export default bookingRouter
