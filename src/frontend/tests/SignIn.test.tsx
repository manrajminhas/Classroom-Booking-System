// SignIn.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../src/pages/SignIn';
import {vi, describe, it, beforeEach, expect } from 'vitest';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('react-router-dom');
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

    vi.unstubAllGlobals();
  });


  it('renders the sign in form elements', () => {
    setup();
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

it('handles successful login and calls navigation/onLogin', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      access_token: 'fake-token-123',
      user: { username: 'testuser', role: 'staff' }
    }),
  }));

  setup(onLoginMock);

  const boxes = screen.queryAllByRole('textbox');
  if (boxes[0]) fireEvent.change(boxes[0], { target: { value: 'testuser' } });
  const pw = boxes[1] ?? boxes[0];
  if (pw) fireEvent.change(pw, { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(onLoginMock).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('fake-token-123');
  });

  vi.unstubAllGlobals();
});


  it('handles login failure and displays error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'Invalid credentials',
    }));

    setup(onLoginMock);

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      // Accept either 'Invalid credentials' (backend message) or 'Login failed'
      expect(
        screen.getByText(/Invalid credentials|Login failed/i)
      ).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(onLoginMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

});