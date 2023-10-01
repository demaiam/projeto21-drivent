import { notFoundError, paymentRequiredError } from "@/errors";
import { enrollmentRepository, ticketsRepository, hotelsRepository } from "@/repositories";

async function getHotels(userId: number) {
  const userEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!userEnrollment) throw notFoundError();

  const userTicket = await ticketsRepository.findTicketByEnrollmentId(userEnrollment.id);
  if (!userTicket) throw notFoundError();

  const validTicket = userTicket.status === "PAID" && userTicket.TicketType.isRemote === false && userTicket.TicketType.includesHotel === true;
  if (!validTicket) throw paymentRequiredError();

  const hotels = await hotelsRepository.getHotels();
  if (!hotels || hotels.length === 0) throw notFoundError();

  return hotels;
}

async function getHotelById(userId: number, hotelId: number) {
  const userEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!userEnrollment) throw notFoundError();

  const userTicket = await ticketsRepository.findTicketByEnrollmentId(userEnrollment.id);
  if (!userTicket) throw notFoundError();

  const validTicket = userTicket.status === "PAID" && userTicket.TicketType.isRemote === false && userTicket.TicketType.includesHotel === true;
  if (!validTicket) throw paymentRequiredError();

  const hotel = await hotelsRepository.getHotelById(hotelId);
  if (!hotel) throw notFoundError();
  
  return hotel;
}

export const hotelsService = {
  getHotels,
  getHotelById
}