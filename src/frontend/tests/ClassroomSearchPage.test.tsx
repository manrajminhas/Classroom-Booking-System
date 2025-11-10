// ClassroomSearchPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClassroomSearchPage from '../src/pages/ClassroomSearchPage';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

const mockAxios = new MockAdapter(axios);

const API = 'http://localhost:3001';
const TEST_USERNAME = 'staffuser';
const MOCK_AVAILABLE_ROOMS = [
    { roomID: 101, building: 'ECS', roomNumber: '123', capacity: 30 },
    { roomID: 205, building: 'COR', roomNumber: '237', capacity: 15 },
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

    fireEvent.change(screen.getByLabelText(/Filter Building:/i), { target: { value: 'ECS' } });
    expect(screen.queryByText(/COR 237 \(Capacity: 15\)/i)).not.toBeInTheDocument();
  });

  it('2. Successfully reserves the selected room and calls search again', async () => {
  // First search returns one room
  mockAxios.onGet(`${API}/bookings/available`).replyOnce(200, [MOCK_AVAILABLE_ROOMS[0]]);
  // Second search (triggered after booking) returns empty
  mockAxios.onGet(`${API}/bookings/available`).replyOnce(200, []);
  // Booking POST
  mockAxios.onPost(`${API}/bookings/ECS/123`).reply(200, { bookingID: 99 });

    setup();

    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2025-12-01' } });
    fireEvent.change(screen.getByLabelText(/Start Time:/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/End Time:/i), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText(/Number of Attendees:/i), { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /Search Availability/i }));

    // Wait for booking button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Book Now/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Book Now/i }));

    await waitFor(() => {
      expect(mockAxios.history.post.length).toBeGreaterThan(0);
    });

    const requestData = JSON.parse(mockAxios.history.post[0].data);
    expect(requestData.attendees).toBe(25);
    expect(alertMock).toHaveBeenCalledWith('Booking created successfully for ECS 123!');

    // After booking, component re-runs search
    await waitFor(() => {
      expect(
        screen.getByText('No rooms available for the selected slot and capacity.')
      ).toBeInTheDocument();
    });
  });
});