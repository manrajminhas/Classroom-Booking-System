import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { DataSource } from 'typeorm';
import { RoomsService } from 'src/rooms/rooms.service';
import { Booking } from 'src/bookings/bookings.entity';
import { User } from 'src/users/users.entity';
import { Room } from 'src/rooms/rooms.entity';

describe('RoomsService', () => {
    let dataSource: DataSource;
    let roomsService: RoomsService;

    beforeEach(async () => { // Use an in-memory SQLite DB for testing
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            dropSchema: true,
            entities: [User, Room, Booking]
        });
        await dataSource.initialize();

        roomsService = new RoomsService(dataSource.getRepository(Room));
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    it('should be defined', () => {
        expect(roomsService).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a new room', async () => {
            const roomData = { building: 'ECS', roomNumber: '123', capacity: 75 };
            const room = await roomsService.create(roomData);
            expect(room).toHaveProperty('roomID');
            expect(room.building).toBe('ECS');
            expect(room.roomNumber).toBe('123');
            expect(room.capacity).toBe(75);
        });

        it('should not add duplicate rooms', async () => {
            const roomData = { building: 'ELW', roomNumber: '220', capacity: 35 };
            await roomsService.create(roomData);
        
            expect(async () => {
                await roomsService.create(roomData);
            }).rejects.toThrow();
        });

        it('should not allow non-positive capacities', async () => {
            const roomData = { building: 'ECS', roomNumber: '101', capacity: 0 };
            expect(async () => {
                await roomsService.create(roomData);
            }).rejects.toThrow('Room capacity must be a positive integer');
        });

        it('should not allow non-integer capacities', async () => {
            const roomData = { building: 'ECS', roomNumber: '101', capacity: 20.5 };
            expect(async () => {
                await roomsService.create(roomData);
            }).rejects.toThrow('Room capacity must be a positive integer');
        });

        it('should allow multiple rooms in the same building with different room numbers', async () => {
            const roomData1 = { building: 'ECS', roomNumber: '101', capacity: 50 };
            const roomData2 = { building: 'ECS', roomNumber: '102', capacity: 60 };
            const room1 = await roomsService.create(roomData1);
            const room2 = await roomsService.create(roomData2);

            const rooms = await roomsService.findAll();

            expect(room1.roomID).not.toBe(room2.roomID);
            expect(rooms.length).toBe(2);
        });

        it('should allow rooms in different buildings with the same room number', async () => {
            const roomData1 = { building: 'ECS', roomNumber: '101', capacity: 50 };
            const roomData2 = { building: 'ELW', roomNumber: '101', capacity: 60 };
            const room1 = await roomsService.create(roomData1);
            const room2 = await roomsService.create(roomData2);

            const rooms = await roomsService.findAll();
            
            expect(room1.roomID).not.toBe(room2.roomID);
            expect(rooms.length).toBe(2);
        });

        it('should require a building and room number', async () => {
            const roomData1 = { building: '', roomNumber: '101', capacity: 50 };
            const roomData2 = { building: 'ECS', roomNumber: '', capacity: 60 };
            
            expect(async () => {
                await roomsService.create(roomData1);
            }).rejects.toThrow('Building and room number are required');
            expect(async () => {
                await roomsService.create(roomData2);
            }).rejects.toThrow('Building and room number are required');
        });
    });
});