import { Inject } from '@nestjs/common';

import { User } from '../../domain/auth/types/auth.type';
import { AUTH_REPOSITORY, type IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';

export class GetUserSessionUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(token: string): Promise<User> {
    return await this.authRepository.validateToken(token);
  }
}
