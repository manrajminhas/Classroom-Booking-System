import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { DataSource } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Booking } from 'src/bookings/bookings.entity';
import { User } from 'src/users/users.entity';
import { Room } from 'src/rooms/rooms.entity';

describe('UsersService', () => {
    let dataSource: DataSource;
    let usersService: UsersService;

    beforeEach(async () => { // Use an in-memory SQLite DB for testing
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            dropSchema: true,
            entities: [User, Room, Booking]
        });
        await dataSource.initialize();

        usersService = new UsersService(dataSource.getRepository(User));
    });

    afterEach(async () => {
        await dataSource.destroy(); // Clean up the DB
    });

    it('should be defined', () => {
        expect(usersService).toBeDefined();
    });
});