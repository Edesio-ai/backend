import { Inject } from '@nestjs/common';

import { AUTH_REPOSITORY, type IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { AuthUserWithSession, LoginBody } from '../../domain/auth/types/auth.type';

export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(body: LoginBody): Promise<AuthUserWithSession> {
    const { email, password } = body;

    return await this.authRepository.loginUser(email, password);
  }
}
