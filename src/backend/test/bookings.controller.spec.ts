import { BadRequestException, NotFoundException } from '@nestjs/common';
import 'reflect-metadata';
import { BookingsController } from 'src/bookings/bookings.controller';
import { BookingsService } from 'src/bookings/bookings.service';
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
        delete: vi.fn()
    };
});