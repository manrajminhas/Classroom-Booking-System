// Main.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Main from '../Main';
import { vi } from 'vitest';

vi.mock('../pages/Dashboard.tsx', () => () => <div>Dashboard Content</div>);
vi.mock('../pages/ClassroomSearchPage.tsx', () => () => <div>Classroom Search Page</div>);
vi.mock('../pages/MyBookings.tsx', () => () => <div>My Bookings Page</div>);
vi.mock('../pages/Admin.tsx', () => () => <div>Admin Dashboard</div>);
vi.mock('../pages/Registrar.tsx', () => () => <div>Registrar Panel</div>);


vi.mock('../pages/SignIn.tsx', () => {
    const MockSignIn = ({ onLogin }) => {
        const handleMockLogin = () => {
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('user', JSON.stringify({ username: 'testuser', role: 'staff' }));
            onLogin();
        };
        return (
            <div data-testid="signin-page">
                Sign In Form 
                <button onClick={handleMockLogin}>Mock Login</button>
            </div>
        );
    };
    return MockSignIn;
});


const setup = (initialEntry = '/') => {
    return render(<Main />, { wrapper: ({ children }) => <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter> });
};

describe('Main Component - Routing and Authentication', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('1. Redirects unauthenticated user from protected routes to SignIn', async () => {
        setup('/MyBookings');

        await waitFor(() => {
            expect(screen.getByTestId('signin-page')).toBeInTheDocument();
        });

        expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Home Page/i })).not.toBeInTheDocument();
    });

    it('2. Shows correct links and navigates after successful login (Staff Role)', async () => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ username: 'staffuser', role: 'staff' }));

        setup('/');

        await waitFor(() => {
            expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Home Page/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Book Classroom/i })).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /Admin/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /Registrar/i })).not.toBeInTheDocument();
        });
    });

    it('3. Grants access and shows link for Admin role', async () => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ username: 'adminuser', role: 'admin' }));

        setup('/Admin');

        await waitFor(() => {
            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Admin/i })).toBeInTheDocument();
        });
    });

    it('4. Grants access and shows link for Registrar role', async () => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ username: 'reguser', role: 'registrar' }));

        setup('/Registrar');

        await waitFor(() => {
            expect(screen.getByText('Registrar Panel')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /Registrar/i })).toBeInTheDocument();
        });
    });

    it('5. Handles logout correctly', async () => {
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify({ username: 'staffuser', role: 'staff' }));

        setup('/HomePage');

        await waitFor(() => {
            fireEvent.click(screen.getByRole('link', { name: /Logout/i }));
        });

        await waitFor(() => {
            expect(screen.getByTestId('signin-page')).toBeInTheDocument();
            expect(localStorage.getItem('token')).toBeNull();
        });
    });
});