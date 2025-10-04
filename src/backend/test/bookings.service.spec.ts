import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { DataSource, Repository } from 'typeorm';
import { Booking } from 'src/bookings/bookings.entity';
import { User } from 'src/users/users.entity';
import { Room } from 'src/rooms/rooms.entity';
import { BookingsService } from 'src/bookings/bookings.service';

describe('RoomsService', () => {
    let dataSource: DataSource;
    let bookingsService: BookingsService;
    let bookingsRepository: Repository<Booking>;
    let roomsRepository: Repository<Room>;

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

        bookingsService = new BookingsService(bookingsRepository, roomsRepository);
    });

    afterEach(async () => {
        await dataSource.destroy(); // Clean up the DB
    });

    it('should be defined', () => {
        expect(bookingsService).toBeDefined();
    });
});