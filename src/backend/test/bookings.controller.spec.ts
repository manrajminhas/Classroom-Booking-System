import { NotFoundException, BadRequestException } from '@nestjs/common';
import 'reflect-metadata';
import { BookingsController } from 'src/bookings/bookings.controller';
import { BookingsService } from 'src/bookings/bookings.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { UsersService } from 'src/users/users.service';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

describe('BookingsController', () => {
    let controller: BookingsController;
    let service: BookingsService;

    const mockBookingsService = {
        create: vi.fn(),
        findByID: vi.fn(),
        findByUser: vi.fn(),
        findFutureForUser: vi.fn(),
        findPastForUser: vi.fn(),
        findByRoom: vi.fn(),
        findByDate: vi.fn(),
        findAll: vi.fn(),
        delete: vi.fn(),
        deleteAll: vi.fn()
    };

    const mockRoomsService = {
        findByLocation: vi.fn(),
        findByID: vi.fn()
    }

    const mockUsersService = {
        findByUsername: vi.fn()
    }

    const mockLogsService = { logAudit: vi.fn() };

    beforeEach(async () => {
        service = mockBookingsService as unknown as BookingsService;
        controller = new BookingsController(
            service,
            mockUsersService as unknown as UsersService,
            mockRoomsService as unknown as RoomsService,
            mockLogsService as any
        );
        (controller as any).logsService = mockLogsService;
    });

   afterEach(() => {
        vi.clearAllMocks();
   }); 

   it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
   });

   describe('findAll', () => {
        it('should return all bookings', async () => {
            const bookings = [
                { id: 1, roomID: 1, userID: 1, startTime: new Date(), endTime: new Date(), attendees: 50 },
                { id: 2, roomID: 2, userID: 2, startTime: new Date(), endTime: new Date(), attendees: 15 }
            ];

            mockBookingsService.findAll.mockResolvedValue(bookings);

            const result = await controller.findAll();

            expect(result).toEqual(bookings);
            expect(mockBookingsService.findAll).toHaveBeenCalledOnce();
        });

        it('should return an empty array if no bookings exist', async () => {
            mockBookingsService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
            expect(mockBookingsService.findAll).toHaveBeenCalledOnce();
        });
   });

    describe('create', () => {
        it('should successfully create and return a booking', async () => {
            const startISO = new Date().toISOString();
            const endISO = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            const booking = { bookingID: 1, room: { roomID: 1, building: 'ECS', roomNumber: '101' }, user: { userID: 1, username: 'a' }, startTime: new Date(startISO), endTime: new Date(endISO), attendees: 10 };

            mockBookingsService.create.mockResolvedValue(booking);
            mockUsersService.findByUsername.mockResolvedValue({ userID: 1, username: 'a' });
            mockRoomsService.findByLocation.mockResolvedValue({ roomID: 1, building: 'ECS', roomNumber: '101' });

            const result = await controller.create('ECS', '101', new Date().toISOString(), new Date().toISOString(), 10, 'a');
            expect(result).toEqual(booking);
       }); 

       it('should throw NotFoundException if room does not exist', async () => {
            mockUsersService.findByUsername.mockResolvedValue({ userID: 1, username: 'a' });
            mockRoomsService.findByLocation.mockResolvedValue(null);

            await expect(controller.create('ECS', '101', new Date().toISOString(), new Date().toISOString(), 5, 'a'))
                .rejects.toThrow(NotFoundException);
       });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUsersService.findByUsername.mockResolvedValue(null);
            mockRoomsService.findByLocation.mockResolvedValue({ roomID: 1, building: 'ECS', roomNumber: '101' });

            await expect(controller.create('ECS', '101', new Date().toISOString(), new Date().toISOString(), 5, 'none'))
                .rejects.toThrow(NotFoundException);
        });

        it('should call logsService.logAudit on successful create', async () => {
            const startISO = new Date().toISOString();
            const endISO = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            const booking = {
                bookingID: 2,
                room: { roomID: 1, building: 'ECS', roomNumber: '101' },
                user: { userID: 1, username: 'a' },
                startTime: new Date(startISO),
                endTime: new Date(endISO),
                attendees: 10
            };

            mockBookingsService.create.mockResolvedValue(booking);
            mockUsersService.findByUsername.mockResolvedValue({ userID: 1, username: 'a' });
            mockRoomsService.findByLocation.mockResolvedValue({ roomID: 1, building: 'ECS', roomNumber: '101' });

            const result = await controller.create('ECS', '101', startISO, endISO, 10, 'a');
            expect(result).toEqual(booking);
            expect(mockLogsService.logAudit).toHaveBeenCalled();
            const callArg = (mockLogsService.logAudit as any).mock.calls[0][0];
            expect(callArg.action).toBe('booking.create');
            expect(callArg.actorName).toBe('a');
            expect(callArg.targetId).toBe(String(booking.bookingID));
        });
    });

    describe('findByUser', () => {
        it('should return all of a user\'s bookings', async () => {
           const bookings = [
                { id: 1, roomID: 1, userID: 1, startTime: new Date(), endTime: new Date(), attendees: 50 },
                { id: 2, roomID: 2, userID: 1, startTime: new Date(), endTime: new Date(), attendees: 15 }
            ];

            mockUsersService.findByUsername.mockResolvedValue({ userID: 1, username: 'abc' });
            mockBookingsService.findByUser.mockResolvedValue(bookings);

            const result = await controller.findByUser('abc');
            expect (result).toEqual(bookings);
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockUsersService.findByUsername.mockResolvedValue(null);
            await expect(controller.findByUser('abc')).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteAll', () => {
        it('should delete all bookings', async () => {
            const bookings = [
                { id: 1, roomID: 1, userID: 1, startTime: new Date(), endTime: new Date(), attendees: 50 },
                { id: 2, roomID: 2, userID: 2, startTime: new Date(), endTime: new Date(), attendees: 15 }
            ];

            mockBookingsService.findAll.mockResolvedValue(bookings);
            
            const result = await controller.deleteAll();
            expect(mockBookingsService.deleteAll).toHaveBeenCalled();
            expect(mockLogsService.logAudit).toHaveBeenCalled();
            const call = (mockLogsService.logAudit as any).mock.calls[0][0];
            expect(call.action).toBe('booking.deleteAll');
            expect(result).toEqual({ message: 'All bookings deleted successfully' });
        });
    });

    describe('deleteBooking', () => {
        it('should successfully delete a booking', async () => {
            const booking = { id: 1, roomID: 1, userID: 1, startTime: new Date(), endTime: new Date(), attendees: 10 };
            mockBookingsService.delete.mockResolvedValue(true);

            const result = await controller.deleteBooking('1');
            expect(mockBookingsService.delete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if booking does not exist', async () => {
            mockBookingsService.delete.mockResolvedValue(false);
            await expect(controller.deleteBooking('1')).rejects.toThrow(NotFoundException);
        })
        it('should log actor when username provided and user exists', async () => {
            mockBookingsService.delete.mockResolvedValue(true);
            mockUsersService.findByUsername.mockResolvedValue({ userID: 7, username: 'deleter' });

            const result = await controller.deleteBooking('1', 'deleter');
            expect(mockBookingsService.delete).toHaveBeenCalledWith(1);
            expect(mockLogsService.logAudit).toHaveBeenCalled();
            const arg = (mockLogsService.logAudit as any).mock.calls[0][0];
            expect(arg.actorName).toBe('deleter');
            expect(arg.actorId).toBe(7);
        });

        it('should use registrar actor when username is registrar', async () => {
            mockBookingsService.delete.mockResolvedValue(true);
            mockUsersService.findByUsername.mockResolvedValue(null);

            const result = await controller.deleteBooking('1', 'registrar');
            expect(mockLogsService.logAudit).toHaveBeenCalled();
            const arg = (mockLogsService.logAudit as any).mock.calls[0][0];
            expect(arg.actorName).toBe('registrar');
            expect(arg.actorId).toBe(0);
        });

    });

    describe('findByDate, findByRoom, past/future user', () => {
        it('should throw BadRequestException for invalid date', async () => {
            await expect(controller.findByDate('not-a-date')).rejects.toThrow(BadRequestException);
        });

        it('should return bookings for a room when room exists', async () => {
            mockRoomsService.findByID.mockResolvedValue({ roomID: 5 });
            mockBookingsService.findByRoom.mockResolvedValue([{ bookingID: 3 }]);

            const res = await controller.findByRoom(5);
            expect(res).toEqual([{ bookingID: 3 }]);
        });

        it('should throw NotFoundException when room does not exist for findByRoom', async () => {
            mockRoomsService.findByID.mockResolvedValue(null);
            await expect(controller.findByRoom(999)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException for past/future when user missing', async () => {
            mockUsersService.findByUsername.mockResolvedValue(null);
            await expect(controller.findPastForUser('x')).rejects.toThrow(NotFoundException);
            await expect(controller.findFutureForUser('x')).rejects.toThrow(NotFoundException);
        });

        it('should return past/future bookings when user exists', async () => {
            mockUsersService.findByUsername.mockResolvedValue({ userID: 9, username: 'u' });
            mockBookingsService.findPastForUser.mockResolvedValue([{ bookingID: 10 }]);
            mockBookingsService.findFutureForUser.mockResolvedValue([{ bookingID: 11 }]);

            const past = await controller.findPastForUser('u');
            const future = await controller.findFutureForUser('u');
            expect(past).toEqual([{ bookingID: 10 }]);
            expect(future).toEqual([{ bookingID: 11 }]);
        });
    });
});