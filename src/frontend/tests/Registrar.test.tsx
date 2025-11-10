// Registrar.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Registrar from '../src/pages/Registrar';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, afterAll, beforeEach } from 'vitest';

const mockAxios = new MockAdapter(axios);

const API = 'http://localhost:3001';

const MOCK_USERS = [
    { userID: 1, username: 'staffuser', role: 'staff', isBlocked: false },
    { userID: 2, username: 'reguser', role: 'registrar', isBlocked: false },
    { userID: 3, username: 'blockedstaff', role: 'staff', isBlocked: true },
];

const MOCK_INITIAL_ROOMS = [{ roomID: 1, building: 'MAIN', roomNumber: '100', capacity: 50 }];

const setup = (initialUsers = MOCK_USERS) => {
  mockAxios.onGet(`${API}/rooms`).reply(200, MOCK_INITIAL_ROOMS);
  mockAxios.onGet(`${API}/logs/filter?`).reply(200, []);
  mockAxios.onGet(`${API}/bookings`).reply(200, []);
  mockAxios.onGet(`${API}/users`).reply(200, initialUsers);

  const usersState = { list: initialUsers.slice() };
  const fakeFetch = vi.fn(async (input: any, init?: any) => {
  const url = String(input);
  const method = (init?.method || 'GET').toUpperCase();
  const ok = (body: any, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const empty = (status = 200) => new Response('', { status });

    if (url.endsWith('/rooms') && method === 'GET') return ok(MOCK_INITIAL_ROOMS);
    if (url.includes('/logs/filter') && method === 'GET') return ok([]);
    if (url.endsWith('/bookings') && method === 'GET') return ok([]);
    if (url.endsWith('/users') && method === 'GET') return ok(usersState.list);
    if (/\/users\/\d+\/status$/.test(url) && method === 'PATCH') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const idMatch = url.match(/\/users\/(\d+)\/status$/);
      const id = idMatch ? Number(idMatch[1]) : 0;
      usersState.list = usersState.list.map(u => u.userID === id ? { ...u, isBlocked: body.isBlocked } : u);
      return ok({ isBlocked: body.isBlocked });
    }

    return empty(404);
  });
  vi.stubGlobal('fetch', fakeFetch as any);

  render(
    <BrowserRouter>
      <Registrar />
    </BrowserRouter>
  );
};

describe('Registrar Component - User Management', () => {
  const confirmMock = vi.spyOn(window, 'confirm');
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios.reset();
    setup();
  });

  afterAll(() => {
    confirmMock.mockRestore();
    alertMock.mockRestore();
    vi.unstubAllGlobals();
  });

  it('1. Blocks an active user successfully and updates the status', async () => {
    confirmMock.mockReturnValue(true);

  mockAxios.onPatch(`${API}/users/1/status`).reply(200, { isBlocked: true });

    mockAxios.onGet(`${API}/users`).replyOnce(200, [
        { userID: 1, username: 'staffuser', role: 'staff', isBlocked: true },
        ...MOCK_USERS.slice(1)
    ]);

  // 'Block' buttons should appear
  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: 'Block' })).toHaveLength(2); // two unblocked users
  });

  const staffRow = screen.getByText('staffuser').closest('tr');
  const blockButton = staffRow?.querySelector('button');
  expect(blockButton).toBeTruthy();
  fireEvent.click(blockButton!);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('User staffuser successfully BLOCKED.');

      const userRow = screen.getByText('staffuser').closest('tr');
      expect(userRow).toHaveTextContent('BLOCKED');

      expect(screen.getByText('staffuser').closest('tr')).toHaveTextContent('Unblock');
    });
  });
});