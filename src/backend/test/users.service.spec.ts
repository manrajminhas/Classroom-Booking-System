import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Booking } from 'src/bookings/bookings.entity';
import { User } from 'src/users/users.entity';
import { Room } from 'src/rooms/rooms.entity';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
    let dataSource: DataSource;
    let usersRepository: Repository<User>;
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

        usersRepository = dataSource.getRepository(User);
        usersService = new UsersService(usersRepository);
    });

    afterEach(async () => {
        await dataSource.destroy(); // Clean up the DB
    });

    it('should be defined', () => {
        expect(usersService).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [
                { userID: 1, username: 'abc', passwordHash: 'password' },
                { userID: 2, username: 'def', passwordHash: 'otherPw' }
            ];
            await usersRepository.save(users);

            const savedUsers = await usersService.findAll();
            expect(savedUsers).toEqual(users)
        });

        it('should return an empty array if no users exist', async () => {
            expect(await usersService.findAll()).toEqual([]);
        });
    });

    describe('findByUsername', () => {
        it('should return the matching user if they exist', async () => {
            const users = [
                { userID: 1, username: 'abc', passwordHash: 'password' },
                { userID: 2, username: 'def', passwordHash: 'otherPw' }
            ];
            await usersRepository.save(users);

            const result = await usersService.findByUsername('def');
            expect(result?.userID).toBe(2);
        });

        it('should return null if the user does not exist', async () => {
            expect(await usersService.findByUsername('abc')).toBeNull;
        });
    });

    describe('findByID', () => {
        it('should return the matching user if they exist', async () => {
            const users = [
                { userID: 1, username: 'abc', passwordHash: 'password' },
                { userID: 2, username: 'def', passwordHash: 'otherPw' }
            ];
            await usersRepository.save(users);

            const result = await usersService.findByID(1);
            expect(result?.username).toBe('abc');
        });

        it('should return null if the user does not exist', async () => {
            expect(await usersService.findByID(2)).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a user and give them a unique ID', async () => {
            const result = await usersService.create('abc', '123');
            expect(result.userID).toBe(1);
            expect(result.username).toBe('abc');
        });

        it('should not allow 2 users to have the same username', async () => {
            await usersRepository.save({ userID: 1, username: 'abc', passwordHash: 'password' });
            await expect(usersService.create('abc', 'def')).rejects.toThrow(ConflictException);
        });

        it('should hash the password', async () => {
            const result = await usersService.create('123', 'abc');
            expect(result.passwordHash).not.toBe('abc');
        });
    });

    describe('validate', () => {
        it('should validate credentials if they are entered correctly and return the user', async () => {
            const user = await usersService.create('123', 'abc');
            expect(user.passwordHash).not.toBeNull();

            const result = await usersService.validate('123', 'abc');
            expect(result).toEqual(user);
        });

        it('should return null if credentials are incorrect', async () => {
            const user = await usersService.create('abc', '123');
            expect(user.passwordHash).not.toBeNull();

            const result = await usersService.validate('123', 'abc');
            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should delete an existing user and return true', async () => {
            const saved = await usersRepository.save({ username: 'todelete', passwordHash: 'h' });
            const res = await usersService.delete(saved.userID);
            expect(res).toBeTruthy();
            const after = await usersService.findByID(saved.userID);
            expect(after).toBeNull();
        });

        it('should return false when deleting a non-existent user', async () => {
            const res = await usersService.delete(9999);
            expect(res).toBe(false);
        });
    });
});