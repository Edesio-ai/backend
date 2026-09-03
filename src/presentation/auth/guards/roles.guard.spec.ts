import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows access when handler is marked public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    expect(guard.canActivate(mockHttpContext({} as Request))).toBe(true);
  });

  it('allows access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === 'isPublic') return false;
      if (key === 'roles') return undefined;
      return undefined;
    });

    expect(guard.canActivate(mockHttpContext({ user: { metadata: { role: 'student' } } } as never))).toBe(true);
  });

  it('allows matching role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === 'isPublic') return false;
      if (key === 'roles') return ['teacher'];
      return undefined;
    });

    expect(guard.canActivate(mockHttpContext({ user: { metadata: { role: 'teacher' } } } as never))).toBe(true);
  });

  it('allows admin even when role is not in required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === 'isPublic') return false;
      if (key === 'roles') return ['teacher'];
      return undefined;
    });

    expect(guard.canActivate(mockHttpContext({ user: { metadata: { role: 'admin' } } } as never))).toBe(true);
  });

  it('throws Forbidden when role does not match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
      if (key === 'isPublic') return false;
      if (key === 'roles') return ['teacher'];
      return undefined;
    });

    expect(() => guard.canActivate(mockHttpContext({ user: { metadata: { role: 'student' } } } as never))).toThrow(
      ForbiddenException,
    );
  });
});

function mockHttpContext(req: Request | Record<string, unknown>): ExecutionContext {
  class TestTarget {}

  async function ProtectedHandler(): Promise<void> {
    //
  }

  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ProtectedHandler,
    getClass: () => TestTarget,
  } as unknown as ExecutionContext;
}
