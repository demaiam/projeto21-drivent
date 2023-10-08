import { Router } from 'express';
import { createBooking, getBooking, updateBooking } from '@/controllers';
import { validateBody, authenticateToken } from '@/middlewares';
import { bookingSchema } from '@/schemas';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .post('/', validateBody(bookingSchema), createBooking)
  .get('/', getBooking)
  .put('/:bookingId', validateBody(bookingSchema), updateBooking);

export { bookingsRouter };
