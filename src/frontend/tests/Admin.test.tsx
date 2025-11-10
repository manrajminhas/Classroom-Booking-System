// Admin.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Admin from '../src/pages/Admin';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

const API = 'http://localhost:3001';

const MOCK_HEALTH = {
    status: 'ok',
    uptime: 1234.56,
    timestamp: new Date().toISOString(),
};

const MOCK_LOGS = [
    {
        id: 1,
        action: 'room.create',
        actorUsername: 'adminuser',
        targetType: 'room',
        targetId: '5',
        createdAt: new Date().toISOString(),
        details: 'Created room SENG 101',
        after: { capacity: 20 },
    },
    {
        id: 2,
        action: 'booking.delete',
        actorUsername: 'registrar',
        targetType: 'booking',
        targetId: '10',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        details: 'Deleted booking 10',
    },
];

const setup = () => {
    render(
        <BrowserRouter>
            <Admin />
        </BrowserRouter>
    );
};

describe('Admin Component Integration Test', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it('loads and displays system health status', async () => {
        // Ensure real timers for polling
        vi.useRealTimers();
        vi.spyOn(axios, 'get').mockImplementation((url: any) => {
            const u = String(url);
            if (u === `${API}/logs`) return Promise.resolve({ data: MOCK_LOGS });
            if (u === `${API}/health`) return Promise.resolve({ data: MOCK_HEALTH });
            return Promise.reject(new Error('Unknown URL'));
        });

        setup();

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Uptime: 1234.6 seconds/i)).toBeInTheDocument();
        });
    });
    
    it('refreshes system health status every 5 seconds', async () => {
        vi.useFakeTimers();
        const mockHealthUpdate = { ...MOCK_HEALTH, uptime: 2000.0, status: 'ok' };
        let healthCalls = 0;
        vi.spyOn(axios, 'get').mockImplementation((url: any) => {
            const u = String(url);
            if (u === `${API}/logs`) return Promise.resolve({ data: MOCK_LOGS });
            if (u === `${API}/health`) {
                healthCalls += 1;
                return Promise.resolve({ data: healthCalls === 1 ? MOCK_HEALTH : mockHealthUpdate });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        setup();

        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(screen.getByText(/Uptime: 1234.6 seconds/i)).toBeInTheDocument();

        await act(async () => {
            vi.advanceTimersByTime(5000);
        });
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(screen.getByText(/Uptime: 2000.0 seconds/i)).toBeInTheDocument();
        
        // Two calls: initial + after interval
        expect(healthCalls).toBeGreaterThanOrEqual(2);
        vi.useRealTimers();
    });

    it('loads and displays the audit log correctly', async () => {
        vi.useRealTimers();
        vi.spyOn(axios, 'get').mockImplementation((url: any) => {
            const u = String(url);
            if (u === `${API}/logs`) return Promise.resolve({ data: MOCK_LOGS });
            if (u === `${API}/health`) return Promise.resolve({ data: MOCK_HEALTH });
            return Promise.reject(new Error('Unknown URL'));
        });

        setup();

        await waitFor(() => {
            expect(screen.getByText('Audit Log')).toBeInTheDocument();

            expect(screen.getByText('adminuser')).toBeInTheDocument();
            expect(screen.getByText('room.create')).toBeInTheDocument();
            
            expect(screen.getByText('registrar')).toBeInTheDocument();
            expect(screen.getByText('booking.delete')).toBeInTheDocument();
        });
    });
});