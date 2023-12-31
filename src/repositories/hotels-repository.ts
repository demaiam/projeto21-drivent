import { prisma } from "@/config"

async function getHotels() {
  const result = await prisma.hotel.findMany();
  return result;
}

async function getHotelById(hotelId: number) {
  const result = await prisma.hotel.findUnique({
    where: {
      id: hotelId
    },
    include: {
      Rooms: true
    }
  });
  return result;
}

async function checkRoomCapacity(roomId: number) {
  const result = await prisma.room.findUnique({
    where: {
      id: roomId
    },
    include: {
      Booking: true
    }
  });
  return result;
}

export const hotelsRepository = {
  getHotels,
  getHotelById,
  checkRoomCapacity
}
