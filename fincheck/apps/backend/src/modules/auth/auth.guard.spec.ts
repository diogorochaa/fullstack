import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './auth.guard';

function createExecutionContext(
  request: Record<string, unknown>,
): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getArgs: () => [],
    getArgByIndex: () => undefined,
    switchToRpc: () => ({
      getContext: () => ({}),
      getData: () => ({}),
    }),
    switchToWs: () => ({
      getClient: () => ({}),
      getData: () => ({}),
      getPattern: () => '',
    }),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  const reflector = {
    getAllAndOverride: vi.fn(),
  };

  const jwtService = {
    verifyAsync: vi.fn(),
  };

  let moduleRef: TestingModule;
  let authGuard: AuthGuard;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    authGuard = moduleRef.get(AuthGuard);
  });

  it('allows public routes without checking a token', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(true);

    await expect(
      authGuard.canActivate(createExecutionContext({})),
    ).resolves.toBe(true);

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects protected routes without a bearer token', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);

    await expect(
      authGuard.canActivate(createExecutionContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches the user id to the request after a valid token check', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    vi.mocked(jwtService.verifyAsync).mockResolvedValue({ sub: 'user-id' });
    const request = {
      headers: {
        authorization: 'Bearer access-token',
      },
    };

    await expect(
      authGuard.canActivate(createExecutionContext(request)),
    ).resolves.toBe(true);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', {
      secret: 'test-jwt-secret',
    });
    expect(request).toMatchObject({ userId: 'user-id' });
  });

  it('rejects invalid bearer tokens', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    vi.mocked(jwtService.verifyAsync).mockRejectedValue(
      new Error('invalid token'),
    );

    await expect(
      authGuard.canActivate(
        createExecutionContext({
          headers: {
            authorization: 'Bearer access-token',
          },
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
