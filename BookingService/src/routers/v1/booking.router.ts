import express from 'express';
import { validateRequestBody } from '../../validators/index.ts';
import { CreateBookingSchema, FinalizeBookingSchema } from '../../validators/booking.validator.ts';
import {
  createBookingController,
  confirmBookingController,
  getMyBookingsController,
  getBookingByIdController,
  cancelBookingController,
} from '../../controllers/booking.controller.ts';
import { extractUserContext, requireUserContext } from '../../middlewares/auth-context.middleware.ts';

const bookingRouter = express.Router();

bookingRouter.use(extractUserContext);

bookingRouter.post(
  '/',
  requireUserContext,
  validateRequestBody(CreateBookingSchema),
  createBookingController
);

bookingRouter.post(
  '/confirm',
  requireUserContext,
  validateRequestBody(FinalizeBookingSchema),
  confirmBookingController
);

bookingRouter.get(
  '/my-bookings',
  requireUserContext,
  getMyBookingsController
);

bookingRouter.get(
  '/:id',
  requireUserContext,
  getBookingByIdController
);

bookingRouter.post(
  '/:id/cancel',
  requireUserContext,
  cancelBookingController
);

export default bookingRouter;
