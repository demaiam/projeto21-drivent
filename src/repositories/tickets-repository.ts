import { Ticket, TicketType } from '@prisma/client';
import { prisma } from '@/config';

type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;

async function getTicketsTypes(): Promise<TicketType[]>{
  const result = await prisma.ticketType.findMany();
  return result;
}

async function getTickets(enrollmentId: number) { //TODO
  const result = await prisma.ticket.findUnique({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true,
    },
  });
  return result;
}

async function postCreateTicket(ticket: CreateTicket) {
  return await prisma.ticket.create({
    data: {
      ...ticket,
    },
  });
}

export const ticketsRepository = {
  getTicketsTypes,
  getTickets,
  postCreateTicket
}