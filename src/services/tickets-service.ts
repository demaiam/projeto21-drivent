import { TicketStatus } from "@prisma/client";
import { ticketsRepository } from "@/repositories";
import { enrollmentsService } from "@/services";
import { notFoundError } from "@/errors";

async function getTicketsTypes() {
  const tickets = await ticketsRepository.getTicketsTypes();

  if (!tickets) throw notFoundError();

  return tickets;
}

async function getTickets(userId: number) {
  const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);
  if (!enrollment) throw notFoundError();

  const tickets = await ticketsRepository.getTickets(enrollment.id);
  if (!tickets) throw notFoundError();

  return tickets;
}

async function postCreateTicket(userId: number, ticketTypeId: number) {
  const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);
  if (!enrollment) throw notFoundError();

  const data = {
    status: TicketStatus.RESERVED,
    ticketTypeId: ticketTypeId,
    enrollmentId: enrollment.id
  }

  await ticketsRepository.postCreateTicket(data);

  const ticket = await ticketsRepository.getTickets(enrollment.id);
  return ticket;
}

export const ticketsService = {
  getTickets,
  getTicketsTypes,
  postCreateTicket
}