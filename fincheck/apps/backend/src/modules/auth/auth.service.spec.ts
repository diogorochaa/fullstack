import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersRepository } from '../../shared/database/repositories/users.repositories';
import { AuthService } from './auth.service';

const { mockCompare, mockHash } = vi.hoisted(() => ({
  mockCompare: vi.fn(),
  mockHash: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  compare: mockCompare,
  hash: mockHash,
}));

describe('AuthService', () => {
  const usersRepository = {
    findUnique: vi.fn(),
    create: vi.fn(),
  };

  const jwtService = {
    signAsync: vi.fn(),
  };

  let moduleRef: TestingModule;
  let authService: AuthService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: usersRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('returns an access token when credentials are valid', async () => {
    vi.mocked(usersRepository.findUnique).mockResolvedValue({
      id: 'user-id',
      password: 'hashed-password',
    });
    mockCompare.mockResolvedValue(true);
    vi.mocked(jwtService.signAsync).mockResolvedValue('access-token');

    await expect(
      authService.signin({
        email: 'john@doe.com',
        password: 'secret123',
      }),
    ).resolves.toEqual({ accessToken: 'access-token' });

    expect(usersRepository.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@doe.com' },
    });
    expect(mockCompare).toHaveBeenCalledWith('secret123', 'hashed-password');
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'user-id' });
  });

  it('rejects signin when the user does not exist', async () => {
    vi.mocked(usersRepository.findUnique).mockResolvedValue(null);

    await expect(
      authService.signin({
        email: 'missing@doe.com',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(mockCompare).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects signin when the password is invalid', async () => {
    vi.mocked(usersRepository.findUnique).mockResolvedValue({
      id: 'user-id',
      password: 'hashed-password',
    });
    mockCompare.mockResolvedValue(false);

    await expect(
      authService.signin({
        email: 'john@doe.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('creates a user and returns an access token on signup', async () => {
    vi.mocked(usersRepository.findUnique).mockResolvedValue(null);
    mockHash.mockResolvedValue('hashed-password');
    vi.mocked(usersRepository.create).mockResolvedValue({
      id: 'user-id',
    });
    vi.mocked(jwtService.signAsync).mockResolvedValue('access-token');

    await expect(
      authService.signup({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'secret123',
      }),
    ).resolves.toEqual({ accessToken: 'access-token' });

    expect(usersRepository.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@doe.com' },
      select: { id: true },
    });
    expect(mockHash).toHaveBeenCalledWith('secret123', 12);
    expect(usersRepository.create).toHaveBeenCalledWith({
      data: {
        email: 'john@doe.com',
        name: 'John Doe',
        password: 'hashed-password',
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'user-id' });
  });

  it('rejects signup when email already exists', async () => {
    vi.mocked(usersRepository.findUnique).mockResolvedValue({ id: 'user-id' });

    await expect(
      authService.signup({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'secret123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(mockHash).not.toHaveBeenCalled();
    expect(usersRepository.create).not.toHaveBeenCalled();
  });
});
