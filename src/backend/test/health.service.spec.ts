import 'reflect-metadata';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { HealthService } from 'src/health/health.service';

describe('HealthService', () => {
    let service: HealthService;
    let mockDataSource: any;

    beforeEach(() => {
        mockDataSource = {
            query: vi.fn(),
            getRepository: vi.fn(),
        };
        service = new HealthService(mockDataSource);
    });

    describe('dbPing', () => {
        it('returns true when query succeeds', async () => {
            mockDataSource.query.mockResolvedValue([{ '1': 1 }]);
            await expect(service.dbPing()).resolves.toBe(true);
        });

        it('returns false when query throws', async () => {
                mockDataSource.query.mockRejectedValue(new Error('oops'));
                await expect(service.dbPing()).resolves.toBe(false);
            });
        });

    describe('isSeeded', () => {
        it('returns true when repo.count > 0', async () => {
        mockDataSource.getRepository.mockReturnValue({ count: vi.fn().mockResolvedValue(2) });
        await expect(service.isSeeded()).resolves.toBe(true);
    });

        it('returns false when repo.count == 0', async () => {
            mockDataSource.getRepository.mockReturnValue({ count: vi.fn().mockResolvedValue(0) });
            await expect(service.isSeeded()).resolves.toBe(false);
        });

        it('returns false when getRepository throws', async () => {
            mockDataSource.getRepository.mockImplementation(() => { throw new Error('no repo'); });
            await expect(service.isSeeded()).resolves.toBe(false);
        });
    });
});