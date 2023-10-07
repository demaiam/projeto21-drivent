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
  return {
    bookingId: result.id,
    Room: result.Room
  };
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
  return result;
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
  return { 
    bookingId: result.roomId,
    Room: result.Room
  };
}

export const bookingRepository = {
  createBooking,
  getBooking,
  updateBooking
}