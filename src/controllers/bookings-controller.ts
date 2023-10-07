import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = req.body.roomId;

  const bookingId = bookingService.createBooking(userId, roomId);

  res.status(httpStatus.OK).send(bookingId);
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = bookingService.getBooking(userId);

  res.status(httpStatus.OK).send(booking);
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = req.body.roomId;
  const bookingId = Number(req.params.bookingId);

  const booking = bookingService.updateBooking(userId, roomId, bookingId);

  res.status(httpStatus.OK).send(booking);
}