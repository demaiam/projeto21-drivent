import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.internet.url()
    }
  })
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.company.companyName(),
      capacity: 10,
      hotelId
    }
  })
}
