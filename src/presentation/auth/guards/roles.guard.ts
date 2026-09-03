import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { isAdmin } from 'src/domain/auth/role.utils';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;
    const req = context.switchToHttp().getRequest();
    const role = req?.user?.metadata?.role;
    if (isAdmin(role)) return true;
    if (!role || !requiredRoles.includes(role)) throw new ForbiddenException('Forbidden');
    return true;
  }
}
