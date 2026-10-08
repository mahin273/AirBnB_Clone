import express from 'express';
import { validateRequestBody } from '../../validators/index.ts';
import { CreateBookingSchema, FinalizeBookingSchema } from '../../validators/booking.validator.ts';
import { createBookingController, confirmBookingController } from '../../controllers/booking.controller.ts';
import { extractUserContext, requireUserContext } from '../../middlewares/auth-context.middleware.ts';

const bookingRouter = express.Router();

bookingRouter.use(extractUserContext);

bookingRouter.post(
  '/',
  requireUserContext,
  validateRequestBody(CreateBookingSchema as any),
  createBookingController
);

bookingRouter.post(
  '/confirm',
  validateRequestBody(FinalizeBookingSchema as any),
  confirmBookingController
);

export default bookingRouter;
