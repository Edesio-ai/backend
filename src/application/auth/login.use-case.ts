import { Inject } from '@nestjs/common';

import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from '../../domain/auth/contract/auth.repository';
import {
  AuthUserWithSession,
  LoginBody,
} from '../../domain/auth/types/auth.type';

export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(body: LoginBody): Promise<AuthUserWithSession> {
    const { email, password } = body;

    return await this.authRepository.loginUser(email, password);
  }
}
