import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { ticketsService } from '@/services';
import { invalidDataError } from '@/errors';

export async function getTicketsTypes(req: AuthenticatedRequest, res: Response) {
  const ticketsTypes = await ticketsService.getTicketsTypes();

  res.status(httpStatus.OK).send(ticketsTypes);
} 

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId as number;

  const tickets = await ticketsService.getTickets(userId);

  res.status(httpStatus.OK).send(tickets);
}

export async function postCreateTicket(req: AuthenticatedRequest, res: Response) {
  const ticketTypeId = req.body.ticketTypeId as number;
  const userId = req.userId as number;

  if (!ticketTypeId) throw invalidDataError("Invalid ticketTypeId");

  const ticket = await ticketsService.postCreateTicket(userId, ticketTypeId);

  res.status(httpStatus.CREATED).send(ticket);
}