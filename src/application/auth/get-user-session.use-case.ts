import { Inject } from '@nestjs/common';

import { AuthTokenData, User } from '../../domain/auth/types/auth.type';
import { AUTH_REPOSITORY, type IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { TokenUserNotFoundError } from '../../domain/auth/errors/auth.errors';

export type GetUserSessionResult = {
  user: User | null;
  refreshedSession: AuthTokenData | null;
};

export class GetUserSessionUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(accessToken?: string, refreshToken?: string): Promise<GetUserSessionResult> {
    if (accessToken) {
      try {
        const user = await this.authRepository.validateToken(accessToken);
        return { user, refreshedSession: null };
      } catch (error) {
        if (!(error instanceof TokenUserNotFoundError)) {
          throw error;
        }
        if (!refreshToken) {
          return { user: null, refreshedSession: null };
        }
      }
    }

    if (!refreshToken) {
      return { user: null, refreshedSession: null };
    }

    try {
      const { authUser, session } = await this.authRepository.refreshSession(refreshToken);
      return {
        user: {
          id: authUser.id,
          email: authUser.email,
          emailConfirmedAt: authUser.emailConfirmedAt,
          metadata: authUser.metadata,
        },
        refreshedSession: session,
      };
    } catch {
      return { user: null, refreshedSession: null };
    }
  }
}
