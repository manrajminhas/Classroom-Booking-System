// Admin.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Admin from '../pages/Admin';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

const mockAxios = new MockAdapter(axios);
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
    mockAxios.onGet(`${API}/logs`).reply(200, MOCK_LOGS);
    
    mockAxios.onGet(`${API}/health`).reply(200, MOCK_HEALTH);
    
    render(
        <BrowserRouter>
            <Admin />
        </BrowserRouter>
    );
};

describe('Admin Component Integration Test', () => {
    vi.useFakeTimers();

    beforeEach(() => {
        mockAxios.reset();
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it('1. Loads and displays system health status on initial load', async () => {
        setup();

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Status: OK/i)).toBeInTheDocument();
            expect(screen.getByText(/Uptime: 1234.6 seconds/i)).toBeInTheDocument();
        });
    });
    
    it('2. Refreshes system health status every 5 seconds via interval', async () => {
        const mockHealthUpdate = { ...MOCK_HEALTH, uptime: 2000.0, status: 'ok' };
        
        mockAxios.onGet(`${API}/health`).replyOnce(200, MOCK_HEALTH);
        
        mockAxios.onGet(`${API}/health`).replyOnce(200, mockHealthUpdate);

        setup();

        await waitFor(() => {
            expect(screen.getByText(/Uptime: 1234.6 seconds/i)).toBeInTheDocument();
        });
        
        vi.advanceTimersByTime(5000);

        await waitFor(() => {
            expect(screen.getByText(/Uptime: 2000.0 seconds/i)).toBeInTheDocument();
        });
        
        expect(mockAxios.history.get.filter(req => req.url === `${API}/health`)).toHaveLength(2);
    });

    it('3. Loads and displays the audit log correctly', async () => {
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