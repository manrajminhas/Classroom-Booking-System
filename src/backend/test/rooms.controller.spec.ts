import { before } from 'node:test';
import 'reflect-metadata';
import { RoomsController } from 'src/rooms/rooms.controller';
import { RoomsService } from 'src/rooms/rooms.service';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';

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
        delete: vi.fn(),
    };

    beforeEach(async () => {
        
    });
});