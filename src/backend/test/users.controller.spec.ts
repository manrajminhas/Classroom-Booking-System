import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: vi.fn(),
    findByUsername: vi.fn(),
    findByID: vi.fn(),
    create: vi.fn(),
    validate: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    Object.values(mockUsersService).forEach((fn) => fn.mockReset());
    controller = new UsersController(mockUsersService as unknown as UsersService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all users without passwordHash', async () => {
      mockUsersService.findAll.mockResolvedValue([
        { userID: 1, username: 'alice', passwordHash: 'x' },
        { userID: 2, username: 'bob', passwordHash: 'y' },
      ]);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalledOnce();
      expect(result).toEqual([
        { userID: 1, username: 'alice' },
        { userID: 2, username: 'bob' },
      ]);
    });

    it('returns empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByUsername', () => {
    it('returns user without passwordHash when found', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        userID: 7,
        username: 'jane',
        passwordHash: 'secret',
      });

      const result = await controller.findByUsername('jane');

      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('jane');
      expect(result).toEqual({ userID: 7, username: 'jane' });
    });

    it('throws NotFoundException when user is missing', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      await expect(controller.findByUsername('missing')).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('missing');
    });
  });

  describe('create', () => {
    it('creates a new user and strips passwordHash', async () => {
      mockUsersService.create.mockResolvedValue({
        userID: 3,
        username: 'newuser',
        passwordHash: 'hashed',
      });

      const result = await controller.create({ username: 'newuser', password: 'pw' } as any);

      expect(mockUsersService.create).toHaveBeenCalledWith('newuser', 'pw');
      expect(result).toEqual({ userID: 3, username: 'newuser' });
    });

    it('throws ConflictException if username already exists', async () => {
      mockUsersService.create.mockRejectedValue(new Error('duplicate'));
      await expect(controller.create({ username: 'dup', password: 'pw' } as any)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith('dup', 'pw');
    });
  });

  describe('login', () => {
    it('returns public user when credentials are valid', async () => {
      mockUsersService.validate.mockResolvedValue({
        userID: 9,
        username: 'valid',
        passwordHash: 'hashed',
      });

      const result = await controller.login({ username: 'valid', password: 'ok' });

      expect(mockUsersService.validate).toHaveBeenCalledWith('valid', 'ok');
      expect(result).toEqual({ userID: 9, username: 'valid' });
    });

    it('throws UnauthorizedException when credentials are invalid', async () => {
      mockUsersService.validate.mockResolvedValue(null);

      await expect(controller.login({ username: 'bad', password: 'no' })).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.validate).toHaveBeenCalledWith('bad', 'no');
    });
  });

  describe('delete', () => {
    it('deletes an existing user', async () => {
      mockUsersService.findByID.mockResolvedValue({ userID: 5, username: 'z' });
      mockUsersService.delete.mockResolvedValue(true);

      await controller.delete('5');

      expect(mockUsersService.findByID).toHaveBeenCalledWith(5);
      expect(mockUsersService.delete).toHaveBeenCalledWith(5);
    });

    it('throws NotFoundException if user does not exist', async () => {
      mockUsersService.findByID.mockResolvedValue(null);

      await expect(controller.delete('42')).rejects.toThrow(NotFoundException);

      expect(mockUsersService.findByID).toHaveBeenCalledWith(42);
      expect(mockUsersService.delete).not.toHaveBeenCalled();
    });
  });

  describe('end-to-end shape checks', () => {
    it('never leaks passwordHash in findAll mapping', async () => {
      mockUsersService.findAll.mockResolvedValue([
        { userID: 1, username: 'a', passwordHash: 'h1', extra: 'x' },
      ]);

      const result = await controller.findAll();

      expect(result[0]).toEqual({ userID: 1, username: 'a' });
      expect((result[0] as any).passwordHash).toBeUndefined();
      expect((result[0] as any).extra).toBeUndefined();
    });

    it('never leaks passwordHash in single-user fetch', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        userID: 11,
        username: 'only',
        passwordHash: 'h',
      });

      const result = await controller.findByUsername('only');

      expect(result).toEqual({ userID: 11, username: 'only' });
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('never leaks passwordHash on login success', async () => {
      mockUsersService.validate.mockResolvedValue({
        userID: 2,
        username: 'login',
        passwordHash: 'h',
      });

      const result = await controller.login({ username: 'login', password: 'pw' });

      expect(result).toEqual({ userID: 2, username: 'login' });
      expect((result as any).passwordHash).toBeUndefined();
    });
  });
});
