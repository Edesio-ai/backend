import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import type { User } from 'src/domain/auth/types/auth.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_BOUND',
        message: 'Authenticated user missing from request',
      });
    }
    return user;
  },
);
