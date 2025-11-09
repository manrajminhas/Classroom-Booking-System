import 'reflect-metadata';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

describe('AuthService', () => {
	let authService: AuthService;

	const mockUsersService = {
		findByUsername: vi.fn(),
	} as any;

	const mockJwtService = {
		sign: vi.fn(),
	} as any;

	beforeEach(() => {
		vi.resetAllMocks();
		authService = new AuthService(mockUsersService, mockJwtService);
        vi.mock('bcrypt', () => ({ compare: vi.fn() })); // Helps mock bcrypt.compare
	});

	it('validateUser returns user without passwordHash', async () => {
		const user = { userID: 11, username: 'abc', role: 'User', passwordHash: 'hashed' };
		mockUsersService.findByUsername.mockResolvedValue(user);
	    (bcrypt as any).compare = vi.fn().mockResolvedValue(true);

		const res = await authService.validateUser('abc', 'pw');
		expect(res).toEqual({ userID: 11, username: 'abc', role: 'User' });
		expect(mockUsersService.findByUsername).toHaveBeenCalledWith('abc');
	});

	it('validateUser throws Unauthorized for unknown user', async () => {
		mockUsersService.findByUsername.mockResolvedValue(null);
		await expect(authService.validateUser('cda', 'pw')).rejects.toThrow();
	});

	it('validateUser throws Unauthorized for bad password', async () => {
		const user = { userID: 2, username: 'bob', role: 'User', passwordHash: 'h' };
		mockUsersService.findByUsername.mockResolvedValue(user);
	    (bcrypt as any).compare = vi.fn().mockResolvedValue(false);

		await expect(authService.validateUser('bob', 'blah')).rejects.toThrow();
	});

	it('login returns token and user payload', async () => {
		const user = { username: 'sam', role: 'Admin', userID: 91 };
		mockJwtService.sign.mockReturnValue('token');

		const res = await authService.login(user);
		expect(mockJwtService.sign).toHaveBeenCalledWith({ username: 'sam', role: 'Admin', sub: 91 });
		expect(res).toEqual({ access_token: 'token', user: { username: 'sam', role: 'Admin', sub: 91 } });
	});
});
