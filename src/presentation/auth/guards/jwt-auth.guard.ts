import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from 'src/domain/auth/contracts/i-auth.repository';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException({
        code: 'TOKEN_USER_NOT_FOUND',
        message: 'Missing authentication token',
      });
    }
    const user = await this.authRepository.validateToken(token);
    req.user = user;
    return true;
  }
  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.slice(7).trim();
      if (bearerToken) return bearerToken;
    }
    const cookieToken = req.cookies?.access_token;
    if (typeof cookieToken === 'string' && cookieToken.trim().length > 0) {
      return cookieToken.trim();
    }
    return null;
  }
}
