import 'reflect-metadata';
import { RoomsController } from 'src/rooms/rooms.controller';
import { RoomsService } from 'src/rooms/rooms.service';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

describe('RoomsController', () => {
    let controller: RoomsController;
    let service: RoomsService;

    const mockRoomsService = {
        create: vi.fn(),
        findAll: vi.fn(),
        findByLocation: vi.fn(),
        findByBuilding: vi.fn(),
        findByCapacity: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    };

    beforeEach(async () => {
        service = new RoomsService(null as any); // Passing null because we will mock the methods
        controller = new RoomsController(service);

        Object.assign(service, mockRoomsService); // Override service methods with mocks
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a room', async () => {
            const roomData = { building: 'ECS', roomNumber: '150', capacity: 55 };
            const createdRoom = { roomID: 1, ...roomData };
            mockRoomsService.create.mockResolvedValue(createdRoom);
            const result = await controller.create(roomData);
            expect(mockRoomsService.create).toHaveBeenCalledWith(roomData);
            expect(result).toEqual(createdRoom);        
        });

        it('should throw ConflictException if room already exists', async () => {
            const roomData = { building: 'ECS', roomNumber: '150', capacity: 55 };
            mockRoomsService.create.mockRejectedValue(new Error('Room already exists'));
            await expect(controller.create(roomData)).rejects.toThrow('Room already exists');
            expect(mockRoomsService.create).toHaveBeenCalledWith(roomData);
        });

        it('should throw BadRequestException if room data is invalid', async () => {
            const roomData = { building: 'COR', roomNumber: '307', capacity: -10 };
            mockRoomsService.create.mockRejectedValue(new Error('Room capacity must be a positive integer'));
            await expect(controller.create(roomData)).rejects.toThrow('Room capacity must be a positive integer');
            expect(mockRoomsService.create).toHaveBeenCalledWith(roomData);

            const roomData2 = { building: '', roomNumber: '101', capacity: 50 };
            mockRoomsService.create.mockRejectedValue(new Error('Building and room number are required'));
            await expect(controller.create(roomData2)).rejects.toThrow('Building and room number are required');
            expect(mockRoomsService.create).toHaveBeenCalledWith(roomData2);

            const roomData3 = { building: 'ECS', roomNumber: '', capacity: 60 };
            mockRoomsService.create.mockRejectedValue(new Error('Building and room number are required'));
            await expect(controller.create(roomData3)).rejects.toThrow('Building and room number are required');
            expect(mockRoomsService.create).toHaveBeenCalledWith(roomData3);
        });
    });

    describe('findAll', () => {
        it('should return an array of rooms', async () => {
            const rooms = [
                { roomID: 1, building: 'ECS', roomNumber: '123', capacity: 150 },
                { roomID: 2, building: 'COR', roomNumber: '307', capacity: 50 },
            ];
            mockRoomsService.findAll.mockResolvedValue(rooms);
            const result = await controller.findAll();
            expect(mockRoomsService.findAll).toHaveBeenCalled();
            expect(result).toEqual(rooms);
        });

        it('should return an empty array if no rooms exist', async () => {
            mockRoomsService.findAll.mockResolvedValue([]);
            const result = await controller.findAll();
            expect(mockRoomsService.findAll).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('findByLocation', () => {
        it('should return a room if found', async () => {
            const room = { roomID: 1, building: 'HSD', roomNumber: '240', capacity: 175 };
            mockRoomsService.findByLocation.mockResolvedValue(room);
            const result = await controller.findByLocation('HSD', '240');
            expect(mockRoomsService.findByLocation).toHaveBeenCalledWith('HSD', '240');
            expect(result).toEqual(room);
        });
        
        it('should throw NotFoundException if room not found', async () => {
            mockRoomsService.findByLocation.mockResolvedValue(null);
            await expect(controller.findByLocation('ECS', '3452')).rejects.toThrow('Room not found');
            expect(mockRoomsService.findByLocation).toHaveBeenCalledWith('ECS', '3452');
        });
    });

    describe('findByBuilding', () => {
        it('should return an array of rooms in the building', async () => {
            const rooms = [
                { roomID: 1, building: 'ECS', roomNumber: '123', capacity: 150 },
                { roomID: 2, building: 'ECS', roomNumber: '256', capacity: 27 }
            ];
            mockRoomsService.findByBuilding.mockResolvedValue(rooms);
            const result = await controller.findByBuilding('ECS');
            expect(mockRoomsService.findByBuilding).toHaveBeenCalledWith('ECS');
            expect(result).toEqual(rooms);
        });

        it('should return an empty array if no rooms in the building', async () => {
            mockRoomsService.findByBuilding.mockResolvedValue([]);
            const result = await controller.findByBuilding('COR');
            expect(mockRoomsService.findByBuilding).toHaveBeenCalledWith('COR');
            expect(result).toEqual([]);
        })
    });

    describe('findByCapacity', () => {
        it('should return an array of rooms with capacity >= given value', async () => {
            const rooms = [
                { roomID: 1, building: 'ECS', roomNumber: '123', capacity: 150 },
                { roomID: 2, building: 'HSD', roomNumber: '240', capacity: 175 }
            ];
            mockRoomsService.findByCapacity.mockResolvedValue(rooms);
            const result = await controller.findByCapacity('100');
            expect(mockRoomsService.findByCapacity).toHaveBeenCalledWith(100);
            expect(result).toEqual(rooms);
        });

        it('should return an empty array if no rooms have the minimum capacity', async () => {
            mockRoomsService.findByCapacity.mockResolvedValue([]);
            const result = await controller.findByCapacity('5');
            expect(mockRoomsService.findByCapacity).toHaveBeenCalledWith(5);
            expect(result).toEqual([]);
        });
    });

    describe('update', () => {
        it('should update and return the room', async () => {
            const room = { roomID: 1, building: 'ECS', roomNumber: '123', capacity: 150 };
            const updatedRoom = { ...room, capacity: 200 };

            mockRoomsService.findByLocation.mockResolvedValue(room);
            mockRoomsService.update.mockResolvedValue(updatedRoom);

            const result = await controller.update('ECS', '123', { capacity: 200 });

            expect(mockRoomsService.findByLocation).toHaveBeenCalledWith('ECS', '123');
            expect(mockRoomsService.update).toHaveBeenCalledWith(1, { capacity: 200 });
            expect(result).toEqual(updatedRoom);
        });

        it('should throw NotFoundException if room not found', async () => {
            mockRoomsService.findByLocation.mockResolvedValue(null);

            await expect(controller.update('ECS', '3142', { capacity: 99 })).rejects.toThrow('Room not found');

            expect(mockRoomsService.findByLocation).toHaveBeenCalledWith('ECS', '3142');
            expect(mockRoomsService.update).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should successfully delete the room', async () => {
            const room = { roomID: 46, building: 'ECS', roomNumber: '356', capacity: 32 };
            mockRoomsService.findByLocation.mockResolvedValue(room);
            mockRoomsService.delete.mockResolvedValue(true);

            await controller.delete('ECS', '356');

            expect(mockRoomsService.findByLocation).toHaveBeenCalledWith('ECS', '356');
            expect(mockRoomsService.delete).toHaveBeenCalledWith(46);
        });

        it('should throw NotFoundException if room not found', async () => {
            mockRoomsService.findByLocation.mockResolvedValue(null);

            await expect(controller.delete('COR', '967')).rejects.toThrow('Room not found');

            expect(mockRoomsService.findByLocation).toHaveBeenCalledWith('COR', '967');
            expect(mockRoomsService.update).not.toHaveBeenCalled();
        });
    });
});