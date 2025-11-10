// Registrar.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Registrar from '../pages/Registrar';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

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
  });

  it('1. Blocks an active user successfully and updates the status', async () => {
    confirmMock.mockReturnValue(true);

    mockAxios.onPatch(`${API}/users/1/status`).reply(200, { isBlocked: true });

    mockAxios.onGet(`${API}/users`).replyOnce(200, [
        { userID: 1, username: 'staffuser', role: 'staff', isBlocked: true },
        ...MOCK_USERS.slice(1)
    ]);

    let blockButton;
    await waitFor(() => {
        blockButton = screen.getAllByRole('button', { name: 'Block' })
            .find(btn => btn.closest('tr')?.textContent?.includes('staffuser'));
        expect(blockButton).toBeInTheDocument();
    });

    fireEvent.click(blockButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('User staffuser successfully BLOCKED.');

      const userRow = screen.getByText('staffuser').closest('tr');
      expect(userRow).toHaveTextContent('BLOCKED');

      expect(screen.getByText('staffuser').closest('tr')).toHaveTextContent('Unblock');
    });
  });
});