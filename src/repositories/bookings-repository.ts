import { prisma } from "@/config";

async function createBooking(userId: number, roomId: number) {
  const result = await prisma.booking.create({
    data: {
      userId,
      roomId
    },
    include: {
      Room: true
    }
  });
  const booking = {
    bookingId: result.id,
    Room: result.Room
  }
  return booking;
}

async function getBooking(userId: number) {
  const result = await prisma.booking.findFirst({
    where: {
      User: {
        id: userId
      }
    },
    include: {
      Room: true
    }
  });
  const booking = {
    bookingId: result.id,
    Room: result.Room
  }
  return booking;
}

async function updateBooking(bookingId: number, roomId: number) {
  const result = await prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId
    },
    include: {
      Room: true
    }
  });
  const booking = { 
    bookingId: result.roomId,
    Room: result.Room
  };
  return booking;
}

export const bookingRepository = {
  createBooking,
  getBooking,
  updateBooking
}