import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const authService = {
    signin: vi.fn(),
    signup: vi.fn(),
  };

  let moduleRef: TestingModule;
  let controller: AuthController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('delegates signin to the auth service', async () => {
    vi.mocked(authService.signin).mockResolvedValue({
      accessToken: 'access-token',
    });

    await expect(
      controller.signin({
        email: 'john@doe.com',
        password: 'secret123',
      }),
    ).resolves.toEqual({ accessToken: 'access-token' });

    expect(authService.signin).toHaveBeenCalledWith({
      email: 'john@doe.com',
      password: 'secret123',
    });
  });

  it('delegates signup to the auth service', async () => {
    vi.mocked(authService.signup).mockResolvedValue({
      accessToken: 'access-token',
    });

    await expect(
      controller.create({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'secret123',
      }),
    ).resolves.toEqual({ accessToken: 'access-token' });

    expect(authService.signup).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'secret123',
    });
  });
});
