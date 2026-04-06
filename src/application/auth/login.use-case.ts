import { Inject } from '@nestjs/common';

import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from '../../interfaces/persistence/auth.repository';
import { AuthSession, LoginBody } from '../../domain/auth/auth.type';

export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(body: LoginBody): Promise<AuthSession> {
    const { email, password } = body;

    const { session } = await this.authRepository.loginUser(email, password);
    return session;
  }
}
