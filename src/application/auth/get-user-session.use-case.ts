import { Inject } from '@nestjs/common';

import { User } from '../../domain/auth/types/auth.type';
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from '../../domain/auth/contract/auth.repository';

export class GetUserSessionUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(token: string): Promise<User> {
    return await this.authRepository.validateToken(token);
  }
}
