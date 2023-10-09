import { bookingRepository, enrollmentRepository, hotelsRepository, ticketsRepository } from "@/repositories";
import { bookingService } from "@/services";
import { Enrollment, Address, Ticket, TicketType, TicketStatus, Room, Booking } from "@prisma/client";

beforeEach(() => {
  jest.clearAllMocks();
});

type MockResult = Omit<Booking, 'userId' | 'roomId' | 'createdAt' | 'updatedAt'> & { Room: Room };

describe('GET /booking', () => {
  it('should return status 404 when user does not have bookings', async () => {
    jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(null);

    const promise = bookingService.getBooking(1);

    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!'
    });
  });

  it('should return status 200 and return booking information when successful', async () => {
    const mockBooking: Booking & { Room: Room } = {
      id: 1, userId: 1, roomId: 1, createdAt: new Date(), updatedAt: new Date(),
      Room: { id: 1, capacity: 10, hotelId: 1, createdAt: new Date(), updatedAt: new Date(), name: "Adam" }
    };

    const mockResult: MockResult = {
      id: 1,
      Room: { id: 1, capacity: 10, hotelId: 1, createdAt: mockBooking.createdAt, updatedAt: mockBooking.updatedAt, name: "Adam" }
    }

    jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking);

    const promise = await bookingService.getBooking(1);

    expect(promise).toEqual(mockResult);
  });
});

describe('POST /booking', () => {
  it('should return status 403 if ticket from user is remote', async () => {
    const mockEnrollment: Enrollment & { Address: Address[] } = {
      id: 1, name: "Adam", cpf: "123", birthday: new Date(), phone: "123", userId: 1, createdAt: new Date(), updatedAt: new Date(),
      Address: [{
        id: 1, cep: "123", street: "1 St.", city: "ABC", state: "DEF", number: "5", neighborhood: "GHI", addressDetail: "JKL", enrollmentId: 1, createdAt: new Date(), updatedAt: new Date()
      }]
    };

    const mockTicket: Ticket & { TicketType: TicketType } = {
      id: 1, ticketTypeId: 1, enrollmentId: 1, status: TicketStatus.PAID, createdAt: new Date(), updatedAt: new Date(),
      TicketType: {
        id: 1, name: "Lorem", price: 250, isRemote: true, includesHotel: true, createdAt: new Date(), updatedAt: new Date()
      }
    };

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValueOnce(mockTicket);

    const promise = bookingService.createBooking(1, 1);

    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Forbidden'
    });
  });

  it('should return status 403 if ticket from user does not include a hotel', async () => {
    const mockEnrollment: Enrollment & { Address: Address[] } = {
      id: 1, name: "Adam", cpf: "123", birthday: new Date(), phone: "123", userId: 1, createdAt: new Date(), updatedAt: new Date(),
      Address: [{
        id: 1, cep: "123", street: "1 St.", city: "ABC", state: "DEF", number: "5", neighborhood: "GHI", addressDetail: "JKL", enrollmentId: 1, createdAt: new Date(), updatedAt: new Date()
      }]
    };

    const mockTicket: Ticket & { TicketType: TicketType } = {
      id: 1, ticketTypeId: 1, enrollmentId: 1, status: TicketStatus.PAID, createdAt: new Date(), updatedAt: new Date(),
      TicketType: {
        id: 1, name: "Lorem", price: 250, isRemote: false, includesHotel: false, createdAt: new Date(), updatedAt: new Date()
      }
    };

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValueOnce(mockTicket);

    const promise = bookingService.createBooking(1, 1);

    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Forbidden'
    });
  });

  it('should return status 403 if ticket from user was not paid', async () => {
    const mockEnrollment: Enrollment & { Address: Address[] } = {
      id: 1, name: "Adam", cpf: "123", birthday: new Date(), phone: "123", userId: 1, createdAt: new Date(), updatedAt: new Date(),
      Address: [{
        id: 1, cep: "123", street: "1 St.", city: "ABC", state: "DEF", number: "5", neighborhood: "GHI", addressDetail: "JKL", enrollmentId: 1, createdAt: new Date(), updatedAt: new Date()
      }]
    };

    const mockTicket: Ticket & { TicketType: TicketType } = {
      id: 1, ticketTypeId: 1, enrollmentId: 1, status: TicketStatus.RESERVED, createdAt: new Date(), updatedAt: new Date(),
      TicketType: {
        id: 1, name: "Lorem", price: 250, isRemote: false, includesHotel: true, createdAt: new Date(), updatedAt: new Date()
      }
    };

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValueOnce(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValueOnce(mockTicket);

    const promise = bookingService.createBooking(1, 1);

    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Forbidden'
    });
  });

  it('should return status 403 if room capacity is full', async () => {
    const mockEnrollment: Enrollment & { Address: Address[] } = {
      id: 1, name: "Adam", cpf: "123", birthday: new Date(), phone: "123", userId: 1, createdAt: new Date(), updatedAt: new Date(),
      Address: [{
        id: 1, cep: "123", street: "1 St.", city: "ABC", state: "DEF", number: "5", neighborhood: "GHI", addressDetail: "JKL", enrollmentId: 1, createdAt: new Date(), updatedAt: new Date()
      }]
    };

    const mockTicket: Ticket & { TicketType: TicketType } = {
      id: 1, ticketTypeId: 1, enrollmentId: 1, status: TicketStatus.RESERVED, createdAt: new Date(), updatedAt: new Date(),
      TicketType: {
        id: 1, name: "Lorem", price: 250, isRemote: false, includesHotel: true, createdAt: new Date(), updatedAt: new Date()
      }
    };

    const mockRoom: Room & { Booking: Booking[] } = {
      id: 1, name: "ABC", capacity: 0, hotelId: 1, createdAt: new Date(), updatedAt: new Date(),
      Booking: []
    };

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValueOnce(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValueOnce(mockTicket);
    jest.spyOn(hotelsRepository, "checkRoomCapacity").mockResolvedValueOnce(mockRoom);

    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Forbidden'
    });
  });

  it('should return status 404 if room does not exist', async () => {
    const mockEnrollment: Enrollment & { Address: Address[] } = {
      id: 1, name: "Adam", cpf: "123", birthday: new Date(), phone: "123", userId: 1, createdAt: new Date(), updatedAt: new Date(),
      Address: [{
        id: 1, cep: "123", street: "1 St.", city: "ABC", state: "DEF", number: "5", neighborhood: "GHI", addressDetail: "JKL", enrollmentId: 1, createdAt: new Date(), updatedAt: new Date()
      }]
    };

    const mockTicket: Ticket & { TicketType: TicketType } = {
      id: 1, ticketTypeId: 1, enrollmentId: 1, status: TicketStatus.PAID, createdAt: new Date(), updatedAt: new Date(),
      TicketType: {
        id: 1, name: "Lorem", price: 250, isRemote: false, includesHotel: true, createdAt: new Date(), updatedAt: new Date()
      }
    };

    const mockBooking: Booking & { Room: Room } = {
      id: 1, userId: 1, roomId: 1, createdAt: new Date(), updatedAt: new Date(),
      Room: { id: 1, capacity: 10, hotelId: 1, createdAt: new Date(), updatedAt: new Date(), name: "Ipsum" }
    };

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValueOnce(mockTicket);
    jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking);
    jest.spyOn(hotelsRepository, "checkRoomCapacity").mockResolvedValueOnce(null);

    const promise = bookingService.createBooking(1, 4);

    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!'
    });
  });

  it('should return status 200 and return booking information when created successfully', async () => {
    const mockEnrollment: Enrollment & { Address: Address[] } = {
      id: 1, name: "Adam", cpf: "123", birthday: new Date(), phone: "123", userId: 1, createdAt: new Date(), updatedAt: new Date(),
      Address: [{
        id: 1, cep: "123", street: "1 St.", city: "ABC", state: "DEF", number: "5", neighborhood: "GHI", addressDetail: "JKL", enrollmentId: 1, createdAt: new Date(), updatedAt: new Date()
      }]
    };

    const mockBooking: Booking & { Room: Room } = {
      id: 1, userId: 1, roomId: 1, createdAt: new Date(), updatedAt: new Date(),
      Room: { id: 1, capacity: 10, hotelId: 1, createdAt: new Date(), updatedAt: new Date(), name: "Ipsum" }
    };

    const mockRoom: Room & { Booking: Booking[] } = {
      id: 1, capacity: 10, hotelId: 1, createdAt: new Date(), updatedAt: new Date(), name: "Ipsum",
      Booking: [{ id: 1, userId: 1, roomId: 1, createdAt: new Date(), updatedAt: new Date() }]
    };

    const mockTicket: Ticket & { TicketType: TicketType } = {
      id: 1, ticketTypeId: 1, enrollmentId: 1, status: TicketStatus.PAID, createdAt: new Date(), updatedAt: new Date(),
      TicketType: {
        id: 1, name: "Lorem", price: 250, isRemote: false, includesHotel: true, createdAt: new Date(), updatedAt: new Date()
      }
    };

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValueOnce(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValueOnce(mockTicket);
    jest.spyOn(bookingRepository, "createBooking").mockResolvedValueOnce(mockBooking);
    jest.spyOn(hotelsRepository, "checkRoomCapacity").mockResolvedValueOnce(mockRoom);

    const promise = await bookingService.createBooking(1, 1);

    expect(promise).toEqual({ bookingId: 1 });
  });
});

describe('PUT /booking/:bookingId', () => {
  /* it('should return status 403 when user has no bookings', async () => {

  }); */

  it('should return status 404 if room does not exist', async () => {
    const mockEnrollment: Enrollment & { Address: Address[] } = {
      id: 1, name: "Adam", cpf: "123", birthday: new Date(), phone: "123", userId: 1, createdAt: new Date(), updatedAt: new Date(),
      Address: [{
        id: 1, cep: "123", street: "1 St.", city: "ABC", state: "DEF", number: "5", neighborhood: "GHI", addressDetail: "JKL", enrollmentId: 1, createdAt: new Date(), updatedAt: new Date()
      }]
    };

    const mockBooking: Booking & { Room: Room } = {
      id: 1, userId: 1, roomId: 1, createdAt: new Date(), updatedAt: new Date(),
      Room: { id: 1, capacity: 10, hotelId: 1, createdAt: new Date(), updatedAt: new Date(), name: "Ipsum" }
    };

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValueOnce(mockEnrollment);
    jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking);
    jest.spyOn(hotelsRepository, "checkRoomCapacity").mockResolvedValueOnce(null);

    const promise = bookingService.updateBooking(1, 4, 1);

    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!'
    });
  });

  it('should return status 200 and return booking information when updated successfully', async () => {
    const mockEnrollment: Enrollment & { Address: Address[] } = {
      id: 1, name: "Adam", cpf: "123", birthday: new Date(), phone: "123", userId: 1, createdAt: new Date(), updatedAt: new Date(),
      Address: [{
        id: 1, cep: "123", street: "1 St.", city: "ABC", state: "DEF", number: "5", neighborhood: "GHI", addressDetail: "JKL", enrollmentId: 1, createdAt: new Date(), updatedAt: new Date()
      }]
    };

    const mockBooking: Booking & { Room: Room } = {
      id: 1, userId: 1, roomId: 1, createdAt: new Date(), updatedAt: new Date(),
      Room: { id: 1, capacity: 10, hotelId: 1, createdAt: new Date(), updatedAt: new Date(), name: "Ipsum" }
    };

    const mockRoom: Room & { Booking: Booking[] } = {
      id: 1, capacity: 10, hotelId: 1, createdAt: new Date(), updatedAt: new Date(), name: "Ipsum",
      Booking: [{ id: 1, userId: 1, roomId: 1, createdAt: new Date(), updatedAt: new Date() }]
    };

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockResolvedValueOnce(mockEnrollment);
    jest.spyOn(bookingRepository, "getBooking").mockResolvedValueOnce(mockBooking);
    jest.spyOn(hotelsRepository, "checkRoomCapacity").mockResolvedValueOnce(mockRoom);
    jest.spyOn(bookingRepository, "updateBooking").mockResolvedValueOnce(mockBooking);

    const promise = await bookingService.updateBooking(1, 2, 1);

    expect(promise).toEqual({ bookingId: 1 });
  });
});