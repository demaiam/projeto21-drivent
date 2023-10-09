import { bookingRepository, ticketsRepository, hotelsRepository, enrollmentRepository } from "@/repositories";
import { notFoundError } from "@/errors";
import { TicketStatus } from "@prisma/client";
import { forbiddenError } from "@/errors/forbidden-error";

async function checkRoomCapacity(roomId: number) {
  const room = await hotelsRepository.checkRoomCapacity(roomId);
  if (!room) throw notFoundError();
  if (room.capacity <= room.Booking.length) throw forbiddenError();
}

async function createBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
    throw forbiddenError();
  }

  await checkRoomCapacity(roomId);
  
  const booking = await bookingRepository.createBooking(userId, roomId);

  return {
    bookingId: booking.id
  }
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.getBooking(userId);
  if (!booking) throw notFoundError();

  return {
    id: booking.id,
    Room: booking.Room
  }
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  const searchBooking = await bookingRepository.getBooking(userId);
  if (!searchBooking) throw forbiddenError();

  await checkRoomCapacity(roomId);

  const booking = await bookingRepository.updateBooking(bookingId, roomId);

  return {
    bookingId: booking.id
  }
}

export const bookingService = {
  createBooking,
  getBooking,
  updateBooking
}