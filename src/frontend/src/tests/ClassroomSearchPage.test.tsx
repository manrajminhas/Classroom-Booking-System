// ClassroomSearchPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClassroomSearchPage from '../pages/ClassroomSearchPage';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

const mockAxios = new MockAdapter(axios);

const API = 'http://localhost:3001';
const TEST_USERNAME = 'staffuser';
const MOCK_AVAILABLE_ROOMS = [
    { roomID: 101, building: 'ARTS', roomNumber: '101', capacity: 30 },
    { roomID: 205, building: 'SCI', roomNumber: '205', capacity: 15 },
];

const setup = () => {
  render(
    <BrowserRouter>
      <ClassroomSearchPage />
    </BrowserRouter>
  );
};

describe('ClassroomSearchPage Integration Test', () => {
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

  beforeAll(() => {
    localStorage.setItem('user', JSON.stringify({ username: TEST_USERNAME, role: 'staff' }));
  });

  afterEach(() => {
    mockAxios.reset();
    vi.clearAllMocks();
  });

  afterAll(() => {
    localStorage.clear();
    alertMock.mockRestore();
  });

  it('1. Successfully searches and displays available rooms with building filter', async () => {
    mockAxios.onGet(`${API}/bookings/available`).reply(200, MOCK_AVAILABLE_ROOMS);

    setup();

    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2025-12-01' } });
    fireEvent.change(screen.getByLabelText(/Start Time:/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time:/i), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText(/Number of Attendees:/i), { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: /Search Availability/i }));

    await waitFor(() => {
      expect(screen.getByText(/Found 2 available room\(s\)./i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Filter Building:/i), { target: { value: 'ARTS' } });
    expect(screen.queryByText(/SCI 205 \(Capacity: 15\)/i)).not.toBeInTheDocument();
  });

  it('2. Successfully reserves the selected room and calls search again', async () => {
    mockAxios.onGet(`${API}/bookings/available`).reply(200, [MOCK_AVAILABLE_ROOMS[0]]);

    const mockPost = mockAxios.onPost(`${API}/bookings/ARTS/101`).reply(200, { bookingID: 99 });

    mockAxios.onGet(`${API}/bookings/available`).replyOnce(200, []);

    setup();

    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2025-12-01' } });
    fireEvent.change(screen.getByLabelText(/Start Time:/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time:/i), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText(/Number of Attendees:/i), { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /Search Availability/i }));

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /Book Now/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Book Now/i }));

    await waitFor(() => {
        const requestData = JSON.parse(mockPost.history.post[0].data);
        expect(requestData.attendees).toBe(25);

        expect(alertMock).toHaveBeenCalledWith('Booking created successfully for ARTS 101!');

        expect(screen.getByText("No rooms available for the selected slot and capacity.")).toBeInTheDocument();
    });
  });
});