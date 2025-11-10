// MyBookings.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import MyBookings from '../src/pages/MyBookings';
import { vi } from 'vitest';

const mockAxios = new MockAdapter(axios);
const API_URL = 'http://localhost:3001';
const TEST_USERNAME = 'teststaff';
const MOCK_USER = { username: TEST_USERNAME, role: 'staff' };

const MOCK_FUTURE_BOOKINGS = [
  {
    bookingID: 101,
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    room: { building: 'LIB', roomNumber: '201' },
  },
];

const MOCK_PAST_BOOKINGS = [
  {
    bookingID: 50,
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 80000000).toISOString(),
    room: { building: 'MATH', roomNumber: 'B05' },
  },
];

const setup = () => {
  localStorage.setItem('user', JSON.stringify(MOCK_USER));
  return render(<MyBookings />);
};

describe('MyBookings Component Integration Test', () => {
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
  const confirmMock = vi.spyOn(window, 'confirm');

  beforeEach(() => {
    mockAxios.reset();
    vi.clearAllMocks();

    mockAxios.onGet(`${API_URL}/bookings/user/${TEST_USERNAME}/future`).reply(200, MOCK_FUTURE_BOOKINGS);
    mockAxios.onGet(`${API_URL}/bookings/user/${TEST_USERNAME}/past`).reply(200, MOCK_PAST_BOOKINGS);
  });

  afterAll(() => {
    localStorage.clear();
    alertMock.mockRestore();
    confirmMock.mockRestore();
  });

  it('loads and displays both upcoming and past bookings correctly', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Upcoming Bookings/i })).toBeInTheDocument();
      expect(screen.getByText('LIB 201')).toBeInTheDocument();

      expect(screen.getByRole('heading', { name: /Booking History/i })).toBeInTheDocument();
      expect(screen.getByText('MATH B05')).toBeInTheDocument();
    });
  });

  it('successfully cancels an upcoming booking and updates the list', async () => {
    mockAxios.onDelete(`${API_URL}/bookings/101`).reply(200, { message: 'Booking deleted successfully' });

    mockAxios.onGet(`${API_URL}/bookings/user/${TEST_USERNAME}/future`).replyOnce(200, []);

    confirmMock.mockReturnValue(true);

    setup();

    await waitFor(() => {
      expect(screen.getByText('LIB 201')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    await waitFor(() => {
      const requestData = JSON.parse(mockAxios.history.delete[0].data);
      expect(requestData.username).toBe(TEST_USERNAME);

      expect(alertMock).toHaveBeenCalledWith('Booking cancelled successfully.');

      expect(screen.queryByText('LIB 201')).not.toBeInTheDocument();
      expect(screen.getByText('No upcoming bookings.')).toBeInTheDocument();
    });
  });
});