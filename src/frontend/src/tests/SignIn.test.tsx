// SignIn.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../pages/SignIn';
import { vi } from 'vitest';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

global.fetch = vi.fn();

const setup = (onLogin = vi.fn()) => {
  render(
    <BrowserRouter>
      <SignIn onLogin={onLogin} />
    </BrowserRouter>
  );
};

describe('SignIn Component', () => {
  const onLoginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (global.fetch as vi.Mock).mockClear();
  });

  it('renders the sign in form elements', () => {
    setup();
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login and calls navigation/onLogin', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'fake-token-123',
        user: { username: 'testuser', role: 'staff' }
      }),
    });

    setup(onLoginMock);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('fake-token-123');
        expect(onLoginMock).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).toHaveBeenCalledWith('/HomePage');
    });
  });

  it('handles login failure and displays error message', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Invalid credentials',
    });

    setup(onLoginMock);

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(onLoginMock).not.toHaveBeenCalled();
  });
});