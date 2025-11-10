import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Booking } from 'src/bookings/bookings.entity';
import { User } from 'src/users/users.entity';
import { Room } from 'src/rooms/rooms.entity';
import { ConflictException, NotFoundException } from '@nestjs/common'; 

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
            // Note: Updated to include required fields like role and isBlocked for consistency
            const users = [
                { userID: 1, username: 'abc', passwordHash: 'password', role: 'staff', isBlocked: false },
                { userID: 2, username: 'def', passwordHash: 'otherPw', role: 'staff', isBlocked: false }
            ];
            await usersRepository.save(users);

            const savedUsers = await usersService.findAll();
            // Use objectContaining for partial matching, as IDs are auto-generated/managed
            expect(savedUsers).toEqual(expect.arrayContaining([
                expect.objectContaining({ username: 'abc' }),
                expect.objectContaining({ username: 'def' })
            ]));
        });

        it('should return an empty array if no users exist', async () => {
            expect(await usersService.findAll()).toEqual([]);
        });
    });

    describe('findByUsername', () => {
        it('should return the matching user if they exist', async () => {
            const users = [
                { userID: 1, username: 'abc', passwordHash: 'password', role: 'staff', isBlocked: false },
                { userID: 2, username: 'def', passwordHash: 'otherPw', role: 'staff', isBlocked: false }
            ];
            await usersRepository.save(users);

            const result = await usersService.findByUsername('def');
            expect(result?.username).toBe('def');
        });

        it('should return null if the user does not exist', async () => {
            expect(await usersService.findByUsername('nonexistent')).toBeNull();
        });
    });

    describe('findByID', () => {
        it('should return the matching user if they exist', async () => {
            const users = [
                { userID: 1, username: 'abc', passwordHash: 'password', role: 'staff', isBlocked: false },
            ];
            const savedUser = await usersRepository.save(users[0]);

            const result = await usersService.findByID(savedUser.userID);
            expect(result?.username).toBe('abc');
        });

        it('should return null if the user does not exist', async () => {
            expect(await usersService.findByID(999)).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a user and give them a unique ID and default role/status', async () => {
            const result = await usersService.create('abc', '123');
            expect(result.userID).toBe(1);
            expect(result.username).toBe('abc');
            expect(result.isBlocked).toBe(false); // Check default status
            expect(result.role).toBe('staff'); // Check default role
        });

        it('should not allow 2 users to have the same username', async () => {
            await usersRepository.save({ userID: 1, username: 'abc', passwordHash: 'password', role: 'staff', isBlocked: false });
            await expect(usersService.create('abc', 'def')).rejects.toThrow(ConflictException);
        });

        it('should hash the password', async () => {
            const result = await usersService.create('123', 'abc');
            expect(result.passwordHash).not.toBe('abc');
        });
    });

    describe('updateStatus', () => {
        it('should successfully block an active user and return the updated user', async () => {
            const activeUser = await usersRepository.save({ username: 'to_block', passwordHash: 'h', role: 'staff', isBlocked: false });
            
            const blockedUser = await usersService.updateStatus(activeUser.userID, true);
            
            expect(blockedUser.isBlocked).toBe(true);
            
            // Verify status in DB
            const checkDb = await usersService.findByID(activeUser.userID);
            expect(checkDb?.isBlocked).toBe(true);
        });

        it('should successfully unblock a blocked user and return the updated user', async () => {
            const blockedUser = await usersRepository.save({ username: 'to_unblock', passwordHash: 'h', role: 'staff', isBlocked: true });
            
            const activeUser = await usersService.updateStatus(blockedUser.userID, false);
            
            expect(activeUser.isBlocked).toBe(false);
        });

        it('should throw NotFoundException if the user ID does not exist', async () => {
            const nonExistentID = 9999;
            
            // Check for the error type (NotFoundException) and the specific message thrown by the service.
            await expect(usersService.updateStatus(nonExistentID, true)).rejects.toThrow(NotFoundException);
            await expect(usersService.updateStatus(nonExistentID, true)).rejects.toThrow(`User with ID ${nonExistentID} not found`); 
        });
    });


    describe('delete', () => {
        it('should delete an existing user and return true', async () => {
            const saved = await usersRepository.save({ username: 'todelete', passwordHash: 'h', role: 'staff', isBlocked: false });
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