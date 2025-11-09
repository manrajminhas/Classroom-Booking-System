import 'reflect-metadata';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { HealthController } from 'src/health/health.controller';
import { ServiceUnavailableException } from '@nestjs/common';

describe('HealthController', () => {
    let controller: HealthController;
    let mockService: any;

    beforeEach(() => {
        mockService = {
            dbPing: vi.fn(),
            isSeeded: vi.fn(),
        };
        controller = new HealthController(mockService);
    });

    it('healthz returns ok', () => {
        const res = controller.healthz();
        expect(res).toHaveProperty('status', 'ok');
        expect(typeof res.uptimeSeconds).toBe('number');
        expect(typeof res.timestamp).toBe('string');
    });

    it('readyz returns ready when dbPing and isSeeded true', async () => {
        mockService.dbPing.mockResolvedValue(true);
        mockService.isSeeded.mockResolvedValue(true);

        const res = await controller.readyz();
        expect(res).toHaveProperty('status', 'ready');
        expect(res).toHaveProperty('db', 'ok');
        expect(res).toHaveProperty('seed', 'ok');
    });

    it('readyz throws ServiceUnavailableException when dbPing is false', async () => {
        mockService.dbPing.mockResolvedValue(false);
        mockService.isSeeded.mockResolvedValue(true);
        await expect(controller.readyz()).rejects.toThrow(ServiceUnavailableException);
    });

    it('readyz throws ServiceUnavailableException when isSeeded is false', async () => {
        mockService.dbPing.mockResolvedValue(true);
        mockService.isSeeded.mockResolvedValue(false);
        await expect(controller.readyz()).rejects.toThrow(ServiceUnavailableException);
    });
});
