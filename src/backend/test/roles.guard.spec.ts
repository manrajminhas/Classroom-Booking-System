import 'reflect-metadata';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { RolesGuard } from 'src/auth/roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let mockReflector: Partial<Reflector>;

    const createMockContext = (userRole?: string) =>
        ({
            getHandler: () => ({}),
            getClass: () => ({}),
            switchToHttp: () => ({
            getRequest: () => (userRole ? { user: { role: userRole } } : {}),
        })
    }) as any;

    beforeEach(() => {
        mockReflector = { getAllAndOverride: vi.fn() };
        guard = new RolesGuard(mockReflector as Reflector);
    });

    it('returns true when no roles metadata is defined', () => {
        (mockReflector.getAllAndOverride as any).mockReturnValue(undefined);
        const ctx = createMockContext();
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows Admin when Admin is required', () => {
        (mockReflector.getAllAndOverride as any).mockReturnValue(['Admin']);
        const ctx = createMockContext('Admin');
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('denies Registrar when Admin is required', () => {
        (mockReflector.getAllAndOverride as any).mockReturnValue(['Admin']);
        const ctx = createMockContext('Registrar');
        expect(guard.canActivate(ctx)).toBe(false);
    });

    it('denies Staff when Admin is required', () => {
        (mockReflector.getAllAndOverride as any).mockReturnValue(['Admin']);
        const ctx = createMockContext('Staff');
        expect(guard.canActivate(ctx)).toBe(false);
    });

    it('allows Registrar when Registrar is required', () => {
        (mockReflector.getAllAndOverride as any).mockReturnValue(['Registrar']);
        const ctx = createMockContext('Registrar');
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows Staff when Staff is required', () => {
        (mockReflector.getAllAndOverride as any).mockReturnValue(['Staff']);
        const ctx = createMockContext('Staff');
        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('allows when user matches one of multiple allowed roles', () => {
        (mockReflector.getAllAndOverride as any).mockReturnValue(['Admin', 'Registrar']);
        const ctx = createMockContext('Registrar');
        expect(guard.canActivate(ctx)).toBe(true);
    });
});