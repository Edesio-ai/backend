import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should allow GET requests without csrf validation', () => {
    fixtures.whenRequestMethodIs('GET');

    const result = fixtures.whenCanActivate();

    fixtures.thenAllowRequest(result);
  });

  it('should throw ForbiddenException when csrf cookie or header is missing', () => {
    fixtures.whenRequestMethodIs('POST');
    fixtures.whenCsrfTokensAreMissing();

    const execute = () => fixtures.whenCanActivate();

    fixtures.thenThrowForbidden(execute);
  });

  it('should throw ForbiddenException when csrf tokens do not match', () => {
    fixtures.whenRequestMethodIs('POST');
    fixtures.whenCsrfTokensAre('cookie-token', 'header-token');

    const execute = () => fixtures.whenCanActivate();

    fixtures.thenThrowForbidden(execute);
  });

  it('should allow mutable requests when csrf tokens match', () => {
    fixtures.whenRequestMethodIs('POST');
    fixtures.whenCsrfTokensAre('same-token', 'same-token');

    const result = fixtures.whenCanActivate();

    fixtures.thenAllowRequest(result);
  });

  it('should allow mutable requests when SkipCsrf metadata is set', () => {
    fixtures.whenRequestMethodIs('POST');
    fixtures.whenCsrfTokensAreMissing();
    fixtures.whenSkipCsrfReflectionReturns(true);

    const result = fixtures.whenCanActivate();

    fixtures.thenAllowRequest(result);
  });
});

class Fixtures {
  public readonly guard: CsrfGuard;
  private readonly reflector: Reflector;
  private readonly request: {
    method: string;
    cookies?: Record<string, string>;
    headers: Record<string, string | undefined>;
  };

  constructor() {
    this.reflector = new Reflector();
    this.guard = new CsrfGuard(this.reflector);

    this.request = {
      method: 'GET',
      headers: {},
    };
  }

  whenRequestMethodIs(method: string) {
    this.request.method = method;
  }

  whenCsrfTokensAreMissing() {
    this.request.cookies = {};
    this.request.headers['x-csrf-token'] = undefined;
  }

  whenCsrfTokensAre(cookieToken: string, headerToken: string) {
    this.request.cookies = { csrf_token: cookieToken };
    this.request.headers['x-csrf-token'] = headerToken;
  }

  whenSkipCsrfReflectionReturns(skip: boolean) {
    jest.spyOn(this.reflector, 'getAllAndOverride').mockReturnValue(skip);
  }

  whenCanActivate() {
    class TestTarget {}

    async function TestHandler(): Promise<void> {
      //
    }

    const context = {
      switchToHttp: () => ({
        getRequest: () => this.request,
      }),
      getHandler: () => TestHandler,
      getClass: () => TestTarget,
    } as unknown as ExecutionContext;

    return this.guard.canActivate(context);
  }

  thenAllowRequest(result: boolean) {
    expect(result).toBe(true);
  }

  thenThrowForbidden(execute: () => unknown) {
    expect(execute).toThrow(ForbiddenException);
    expect(execute).toThrow('Invalid CSRF token');
  }
}
