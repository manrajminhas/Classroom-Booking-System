import { NotFoundException } from '@nestjs/common';
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
        findByLocation: vi.fn()
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
    })
});