import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from 'src/domain/auth/contract/auth.repository';
import { Request } from 'express';
import { TokenUserNotFoundError } from 'src/domain/auth/errors';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractToken(req);

    if (!token) {
      throw new TokenUserNotFoundError('Missing authentication token');
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
