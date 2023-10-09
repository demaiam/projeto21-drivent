import httpStatus from 'http-status';
import supertest from 'supertest';
import { cleanDb } from '../helpers';
import app, { init } from '@/app';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { generateValidToken } from '../helpers';
import { TicketStatus } from '@prisma/client';
import { 
  createPayment, 
  createTicketTypeWithParams, 
  createUser, 
  createTicket, 
  createEnrollmentWithAddress, 
  createHotel, 
  createBooking, 
  createRoom} from '../factories';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 200 and booking data', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithParams(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.price);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    await createBooking(user.id, room.id);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      Room: {
        id: expect.any(Number),
        name: expect.any(String),
        hotelId: expect.any(Number),
        capacity: expect.any(Number),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }
    }));
  })

});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 400 if body is empty', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({});

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it('should respond with status 200 and booking id', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithParams(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.id);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);

    const body = { roomId: room.id }

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(expect.objectContaining({
      bookingId: expect.any(Number)
    }));
  })
});

describe('PUT /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 400 if body is empty', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({});

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it('should respond with status 200 and booking id', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithParams(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createPayment(ticket.id, ticketType.id);
    const hotel = await createHotel();
    const room = await createRoom(hotel.id);
    const booking = await createBooking(user.id, room.id);

    const body = { roomId: room.id };

    const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(expect.objectContaining({
      bookingId: expect.any(Number)
    }));
  });
})