import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { DataSource, Repository } from 'typeorm';
import { Booking } from 'src/bookings/bookings.entity';
import { User } from 'src/users/users.entity';
import { Room } from 'src/rooms/rooms.entity';
import { BookingsService } from 'src/bookings/bookings.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('RoomsService', () => {
    let dataSource: DataSource;
    let bookingsService: BookingsService;
    let bookingsRepository: Repository<Booking>;
    let roomsRepository: Repository<Room>;
    let usersRepository: Repository<User>;
    let room: Room;
    let user: User;

    beforeEach(async () => { // Use an in-memory SQLite DB for testing
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            dropSchema: true,
            entities: [Booking, Room, User]
        });
        await dataSource.initialize();

        bookingsRepository = dataSource.getRepository(Booking);
        roomsRepository = dataSource.getRepository(Room);
        usersRepository = dataSource.getRepository(User);

        bookingsService = new BookingsService(bookingsRepository, roomsRepository);

        room = await roomsRepository.save({ building: 'ECS', roomNumber: '101', capacity: 90, avEquipment: '1 document camera; 2 digital video projectors; A built-in classroom computer with webcam; Lecture capture capability; Podium; Room speakers; Touch panel controls for AV system; Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic' });
        user = await usersRepository.save({ userID: 1, username: 'testUser', passwordHash: 'abc123' });

    });

    afterEach(async () => {
        await dataSource.destroy(); // Clean up the DB
    });

    it('should be defined', () => {
        expect(bookingsService).toBeDefined();
    });

    describe('create', () => {
        it('should create a booking given valid user, room, date, and attendees', async () => {
            const start = new Date('2025-10-21T12:00:00');
            const end = new Date('2025-10-21T13:20:00');

            const booking = await bookingsService.create(1, 1, start, end, 50);

            expect(booking.bookingID).toBeDefined();
            expect(booking.room.roomID).toBe(1);
            expect(booking.user.userID).toBe(1);
            expect(booking.startTime).toBe(start);
            expect(booking.endTime).toBe(end);
            expect(booking.attendees).toBe(50);
        });

        it('should not create a booking if attendees > room capacity', async () => {
            const start = new Date('2025-10-21T12:00:00');
            const end = new Date('2025-10-21T13:20:00');
        
            await expect(bookingsService.create(1, 1, start, end, 1000)).rejects.toThrow(BadRequestException);
        });

        it('should not creating a booking if attendees < 1', async () => {
            const start = new Date('2025-10-21T12:00:00');
            const end = new Date('2025-10-21T13:20:00');

            await expect(bookingsService.create(1, 1, start, end, 0)).rejects.toThrow(BadRequestException);
        });

        it('should not creating a booking if end time < start time', async () => {
            const start = new Date('2025-10-21T12:00:00');
            const end = new Date('2025-10-21T11:00:00');

            await expect(bookingsService.create(1, 1, start, end, 50)).rejects.toThrow(BadRequestException);
        });

        it('should not creating a booking if start time is in the past', async () => {
            const start = new Date('2025-09-21T12:00:00');
            const end = new Date('2025-09-21T13:20:00');
            
            await expect(bookingsService.create(1, 1, start, end, 50)).rejects.toThrow(BadRequestException);
        });

        it('should not create a booking if room does not exist', async () => {
            const start = new Date('2025-10-21T12:00:00');
            const end = new Date('2025-10-21T13:20:00');
            
            await expect(bookingsService.create(1, 0, start, end, 25)).rejects.toThrow(NotFoundException);
        });

        it('should not create a booking if one already exists for the same room at the same time', async () => {
            const start1 = new Date('2025-10-21T12:00:00');
            const end1 = new Date('2025-10-21T15:00:00');
            
            const booking1 = await bookingsService.create(1, 1, start1, end1, 55);
            expect(booking1).toBeDefined();

            await usersRepository.save({ userID: 2, username: 'otherUser', passwordHash: '123abc' });

            const start2 = new Date('2025-10-21T13:00:00')
            const end2 = new Date('2025-10-21T13:50:00')       
            
            await expect(bookingsService.create(2, 1, start2, end2, 20)).rejects.toThrow(ConflictException);
        });

        it('should not allow double bookings', async () => {
            const start1 = new Date('2025-10-21T12:00:00')
            const end1 = new Date('2025-10-21T15:00:00')  

            const start2 = new Date('2025-10-21T12:00:00')
            const end2 = new Date('2025-10-21T15:00:00') 

            await usersRepository.save({ userID: 2, username: 'otherUser', passwordHash: '123abc' });

            const booking1 = await bookingsService.create(1, 1, start1, end1, 55);
            expect(booking1).toBeDefined();

            await expect(bookingsService.create(2, 1, start2, end2, 20)).rejects.toThrow(ConflictException);
        });

        it('should allow multiple bookings from the same user', async () => {
            const start1 = new Date('2025-10-21T12:00:00')
            const end1 = new Date('2025-10-21T15:00:00')  

            const start2 = new Date('2025-10-25T09:00:00')
            const end2 = new Date('2025-10-25T09:50:00') 

            await roomsRepository.save({ building: 'COR', roomNumber: '312', capacity: 25, avEquipment: '1 document camera; 2 digital video projectors; Wireless mic' });

            const booking1 = await bookingsService.create(1, 1, start1, end1, 55);
            expect(booking1).toBeDefined();

            const booking2 = await bookingsService.create(1, 2, start2, end2, 20);
            expect(booking2.room.roomID).toBe(2);
            expect(booking2.user.userID).toBe(1);
            expect(booking2.startTime).toBe(start2);
            expect(booking2.endTime).toBe(end2);
            expect(booking2.attendees).toBe(20);
        });

        it('should allow multiple bookings for the same room at different times', async () => {
            const start1 = new Date('2025-10-21T12:00:00')
            const end1 = new Date('2025-10-21T15:00:00')  

            const start2 = new Date('2025-10-25T09:00:00')
            const end2 = new Date('2025-10-25T09:50:00') 

            const booking1 = await bookingsService.create(1, 1, start1, end1, 55);
            expect(booking1).toBeDefined();

            const booking2 = await bookingsService.create(1, 1, start2, end2, 20);
            expect(booking2.room.roomID).toBe(1);
            expect(booking2.user.userID).toBe(1);
            expect(booking2.startTime).toBe(start2);
            expect(booking2.endTime).toBe(end2);
            expect(booking2.attendees).toBe(20);            
        });
    });

    describe('findByID', () => {
        it('should return a booking if the ID is valid', async () => {
            const start = new Date('2025-10-21T12:00:00');
            const end = new Date('2025-10-21T13:20:00');

            const booking = await bookingsRepository.save({
                user,
                room,
                startTime: start,
                endTime: end,
                attendees: 25
            });

            const result = await bookingsService.findByID(booking.bookingID);
            
            expect(result?.bookingID).toBe(booking.bookingID);
            expect(result?.room.roomID).toBe(room.roomID);
            expect(result?.user.userID).toBe(user.userID);
            expect(result?.startTime).toEqual(start);
            expect(result?.endTime).toEqual(end);
            expect(result?.attendees).toBe(25);
        });

        it('should return the correct booking if multiple exist', async () => {
            const start1 = new Date('2025-10-21T12:00:00');
            const end1 = new Date('2025-10-21T13:20:00');
            const start2 = new Date('2025-10-22T12:00:00');
            const end2 = new Date('2025-10-22T13:20:00');
            const start3 = new Date('2025-10-23T12:00:00');
            const end3 = new Date('2025-10-23T13:20:00');

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });

            const result = await bookingsService.findByID(booking2.bookingID);
            
            expect(result?.bookingID).toBe(booking2.bookingID);
            expect(result?.room.roomID).toBe(room.roomID);
            expect(result?.user.userID).toBe(user.userID);
            expect(result?.startTime).toEqual(start2);
            expect(result?.endTime).toEqual(end2);
            expect(result?.attendees).toBe(4);
        });

        it('should return null if no booking with the ID exists', async () => {
            const result = await bookingsService.findByID(0);
            expect(result).toBeNull();           
        });
    });

    describe('findByUser', () => {
        it('should return all of a user\'s (future) bookings', async () => {
            const start1 = new Date('2025-10-21T12:00:00');
            const end1 = new Date('2025-10-21T13:20:00');
            const start2 = new Date('2025-10-22T12:00:00');
            const end2 = new Date('2025-10-22T13:20:00');
            const start3 = new Date('2025-10-23T12:00:00');
            const end3 = new Date('2025-10-23T13:20:00');

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });      
            
            const result = await bookingsService.findByUser(1);
            expect(result).toHaveLength(3);
            expect(result[0].attendees).toBe(25);
            expect(result[1].endTime).toEqual(end2);
            expect(result[2].startTime).toEqual(start3);
        });

        it('should return an empty array if a user has no bookings', async () => {
            const result = await bookingsService.findByUser(1);
            expect(result).toEqual([]);
        });

        it('should return an empty array if user does not exist', async () => {
            const result = await bookingsService.findByUser(0);
            expect(result).toEqual([]);
        });

        it('should also return past bookings', async () => {
            const start1 = new Date('2025-09-21T12:00:00');
            const end1 = new Date('2025-09-21T13:20:00');
            const start2 = new Date('2025-09-22T12:00:00');
            const end2 = new Date('2025-09-22T13:20:00');
            const start3 = new Date('2025-09-23T12:00:00');
            const end3 = new Date('2025-09-23T13:20:00');

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });

            const result = await bookingsService.findByUser(1);
            expect(result.length).toBe(3);
        });
    });

    describe('findFutureForUser', () => {
        it('should return all of a user\'s future bookings', async () => {
            const start1 = new Date('2025-10-21T12:00:00');
            const end1 = new Date('2025-10-21T13:20:00');
            const start2 = new Date('2025-10-22T12:00:00');
            const end2 = new Date('2025-10-22T13:20:00');
            const start3 = new Date('2025-10-23T12:00:00');
            const end3 = new Date('2025-10-23T13:20:00');

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });      
            
            const result = await bookingsService.findFutureForUser(1);
            expect(result).toHaveLength(3);
            expect(result[0].attendees).toBe(25);
            expect(result[1].endTime).toEqual(end2);
            expect(result[2].startTime).toEqual(start3);
        });

        it('should not return any of a user\'s past bookings', async () => {
            const start1 = new Date('2025-09-21T12:00:00');
            const end1 = new Date('2025-09-21T13:20:00');
            const start2 = new Date('2025-10-22T12:00:00');
            const end2 = new Date('2025-10-22T13:20:00');
            const start3 = new Date('2025-10-23T12:00:00');
            const end3 = new Date('2025-10-23T13:20:00');

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });      
            
            const result = await bookingsService.findFutureForUser(1);
            expect(result).toHaveLength(2);
            expect(result[0].endTime).toEqual(end2);
            expect(result[1].startTime).toEqual(start3);
        });

        it('should return an empty array if user does not exist', async () => {
            const result = await bookingsService.findFutureForUser(0);
            expect(result).toEqual([]);
        });

        it('should return an empty array if user has no future bookings', async () => {
            const result = await bookingsService.findFutureForUser(1);
            expect(result).toEqual([]);            
        });
    });

    describe('findPastForUser', () => {
       it('should return all of a user\'s past bookings', async () => {
            const start1 = new Date('2025-09-21T12:00:00');
            const end1 = new Date('2025-09-21T13:20:00');
            const start2 = new Date('2025-09-22T12:00:00');
            const end2 = new Date('2025-09-22T13:20:00');
            const start3 = new Date('2025-09-23T12:00:00');
            const end3 = new Date('2025-09-23T13:20:00');

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });      
            
            const result = await bookingsService.findPastForUser(1);
            expect(result).toHaveLength(3);
            expect(result[0].attendees).toBe(25);
            expect(result[1].endTime).toEqual(end2);
            expect(result[2].startTime).toEqual(start3);
        });

        it('should not return any of a user\'s future bookings', async () => {
            const start1 = new Date('2025-03-12T12:00:00');
            const end1 = new Date('2025-03-12T13:20:00');
            const start2 = new Date('2026-12-22T12:00:00');
            const end2 = new Date('2026-12-22T13:20:00');
            const start3 = new Date('2026-12-23T12:00:00');
            const end3 = new Date('2026-12-23T13:20:00');

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });      
            
            const result = await bookingsService.findPastForUser(1);
            expect(result).toHaveLength(1);
            expect(result[0].attendees).toBe(25);
        });

        it('should return an empty array if user does not exist', async () => {
            const result = await bookingsService.findPastForUser(0);
            expect(result).toEqual([]);
        });

        it('should return an empty array if user has no future bookings', async () => {
            const result = await bookingsService.findPastForUser(1);
            expect(result).toEqual([]);            
        });
    });

    describe('findByRoom', () => {
        it('should return an empty array if the room has no bookings', async () => {
            const result = await bookingsService.findByRoom(1);
            expect(result).toEqual([]);
        });

        it('should return an empty array if the room does not exist', async () => {
            const result = await bookingsService.findByRoom(0);
            expect(result).toEqual([]);
        })

        it('should return all of a room\'s past & future bookings', async () => {
            const start1 = new Date('2025-03-12T12:00:00');
            const end1 = new Date('2025-03-12T13:20:00');
            const start2 = new Date('2026-12-22T12:00:00');
            const end2 = new Date('2026-12-22T13:20:00');
            const start3 = new Date('2026-12-23T12:00:00');
            const end3 = new Date('2026-12-23T13:20:00');                    

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });   

            const result = await bookingsService.findByRoom(1);
            
            expect(result).toHaveLength(3);
            expect(result[0].attendees).toBe(25);
            expect(result[1].room.roomID).toBe(1);
            expect(result[2].startTime).toEqual(start3);
        });

        it('should only return the given room\'s bookings', async () => {
            const room2 = await roomsRepository.save({ 
                building: 'COR', 
                roomNumber: '345', 
                capacity: 57, 
                avEquipment: 'Podium; Room speakers; Touch panel controls for AV system; Wireless mic' 
            });

            const start1 = new Date('2025-03-12T12:00:00');
            const end1 = new Date('2025-03-12T13:20:00');
            const start2 = new Date('2026-12-22T12:00:00');
            const end2 = new Date('2026-12-22T13:20:00');
            const start3 = new Date('2026-12-23T12:00:00');
            const end3 = new Date('2026-12-23T13:20:00'); 

            const booking1 = await bookingsRepository.save({
                user,
                room: room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room: room2,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room: room2,
                startTime: start3,
                endTime: end3,
                attendees: 21
            });
            
            const result = await bookingsService.findByRoom(room2.roomID);
            expect(result).toHaveLength(2);
        });
    });

    describe('findByDate', async () => {
        it('should return an empty array if there are no bookings', async () => {
            const result = await bookingsService.findByDate(new Date('2025-03-12'));
            expect(result).toHaveLength(0);
        });

        it('should return an empty array if there are no bookings on the given date', async () => {
            const start1 = new Date('2025-03-12T12:00:00');
            const end1 = new Date('2025-03-12T13:20:00');
            const start2 = new Date('2026-12-22T12:00:00');
            const end2 = new Date('2026-12-22T13:20:00');

            const booking1 = await bookingsRepository.save({
                user,
                room: room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room: room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });

            const result = await bookingsService.findByDate(new Date('2025-10-21'));
            expect(result).toHaveLength(0);
        });

        it('should return all the bookings on the given day', async () => {
            const start1 = new Date('2025-03-12T12:00:00');
            const end1 = new Date('2025-03-12T13:20:00');
            const start2 = new Date('2025-03-12T13:30:00');
            const end2 = new Date('2025-03-12T14:20:00');
            const start3 = new Date('2025-05-12T15:00:00');
            const end3 = new Date('2025-05-12T18:00:00');          

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 4
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 45
            });

            const result = await bookingsService.findByDate(new Date('2025-03-12'))
            expect(result).toHaveLength(2);
        });
    });

    describe('findAll', () => {
       it('should return an empty array if no bookings exist', async () => {
            const result = await bookingsService.findAll();
            expect(result).toEqual([]);
       });

       it('should return all bookings, with multiple users, dates, and rooms', async () => {
            const user2 = await usersRepository.save({ userID: 2, username: 'otherUser', passwordHash: '123abc' });
            const room2 = await roomsRepository.save({ 
                building: 'COR', 
                roomNumber: '345', 
                capacity: 57, 
                avEquipment: 'Podium; Room speakers; Touch panel controls for AV system; Wireless mic' 
            });

            const start1 = new Date('2025-03-12T12:00:00');
            const end1 = new Date('2025-03-12T13:20:00');
            const start2 = new Date('2025-09-15T13:30:00');
            const end2 = new Date('2025-09-15T14:20:00');
            const start3 = new Date('2026-05-12T15:00:00');
            const end3 = new Date('2026-05-12T18:00:00');          

            const booking1 = await bookingsRepository.save({
                user,
                room2,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user2,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 34
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 45
            });
            
            const result = await bookingsService.findAll();
            expect(result).toHaveLength(3);
       });
    });

    describe('delete', () => {
        it('should return false if booking does not exist', async () => {
            const result = await bookingsService.delete(1);
            expect(result).toBeFalsy;
        });

        it('should return true if the booking was deleted', async () => {
            const start = new Date('2025-10-21T12:00:00');
            const end = new Date('2025-10-21T13:20:00');

            const booking = await bookingsRepository.save({
                user,
                room,
                startTime: start,
                endTime: end,
                attendees: 45
            });

            const result = await bookingsService.delete(1);
            expect(result).toBeTruthy;
        });

        it('should remove the booking from the database', async () => {
            const start1 = new Date('2025-03-12T12:00:00');
            const end1 = new Date('2025-03-12T13:20:00');
            const start2 = new Date('2025-09-15T13:30:00');
            const end2 = new Date('2025-09-15T14:20:00');
            const start3 = new Date('2026-05-12T15:00:00');
            const end3 = new Date('2026-05-12T18:00:00');          

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 34
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 45
            });   
            
            const result = await bookingsService.delete(2);
            expect(result).toBeTruthy;

            const remaining = await bookingsRepository.find();
            expect(remaining).toHaveLength(2);
        });
    });

    describe('deleteAll', () => {
        it('should delete all bookings from the database', async () => {
            const start1 = new Date('2025-03-12T12:00:00');
            const end1 = new Date('2025-03-12T13:20:00');
            const start2 = new Date('2025-09-15T13:30:00');
            const end2 = new Date('2025-09-15T14:20:00');
            const start3 = new Date('2026-05-12T15:00:00');
            const end3 = new Date('2026-05-12T18:00:00');          

            const booking1 = await bookingsRepository.save({
                user,
                room,
                startTime: start1,
                endTime: end1,
                attendees: 25
            });
            const booking2 = await bookingsRepository.save({
                user,
                room,
                startTime: start2,
                endTime: end2,
                attendees: 34
            });
            const booking3 = await bookingsRepository.save({
                user,
                room,
                startTime: start3,
                endTime: end3,
                attendees: 45
            }); 
            
            expect(await bookingsService.findAll()).toHaveLength(3);
            const result = await bookingsService.deleteAll();
            expect(await bookingsService.findAll()).toHaveLength(0);
        });
    });
});