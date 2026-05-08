import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthRepository } from 'src/domain/auth/contract/auth.repository';
import type { Request } from 'express';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let authRepository: jest.Mocked<Pick<AuthRepository, 'validateToken'>>;
  let reflector: Reflector;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    authRepository = {
      validateToken: jest.fn(),
    };
    reflector = new Reflector();
    guard = new JwtAuthGuard(authRepository as never, reflector);
  });

  it('allows access when handler is marked public without validating token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const req = {};
    await guard.canActivate(mockHttpContext(req as unknown as Request));

    expect(authRepository.validateToken).not.toHaveBeenCalled();
  });

  it('throws when no token on protected route', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    await expect(
      guard.canActivate(
        mockHttpContext({ headers: {}, cookies: {} } as unknown as Request),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authRepository.validateToken).not.toHaveBeenCalled();
  });

  it('sets user when token validates', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const user = {
      id: 'u1',
      email: 'x@y.com',
      emailConfirmedAt: null,
      metadata: { role: 'teacher' as const },
    };
    authRepository.validateToken.mockResolvedValue(user);

    const req = {
      headers: {},
      cookies: { access_token: 'ok-token   ' },
    } as unknown as Request;

    await guard.canActivate(mockHttpContext(req));

    expect(authRepository.validateToken).toHaveBeenCalledWith('ok-token');
    expect(req.user).toEqual(user);
  });
});

function mockHttpContext(req: Request): ExecutionContext {
  class TestTarget {}

  async function ProtectedHandler(): Promise<void> {
    //
  }

  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ProtectedHandler,
    getClass: () => TestTarget,
  } as ExecutionContext;
}
