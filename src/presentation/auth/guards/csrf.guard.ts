import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SKIP_CSRF_KEY } from '../decorator/skip-csrf.decorator';
import type { Request } from 'express';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipCsrf) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();

    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return true;
    }

    const cookieToken = req.cookies?.csrf_token;
    const headerToken = req.headers['x-csrf-token'];

    if (typeof cookieToken !== 'string' || typeof headerToken !== 'string') {
      throw new ForbiddenException('Invalid CSRF token');
    }

    const cookieBuffer = Buffer.from(cookieToken);
    const headerBuffer = Buffer.from(headerToken);

    if (cookieBuffer.length !== headerBuffer.length || !timingSafeEqual(cookieBuffer, headerBuffer)) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
