import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY, type IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';

export class ResetPasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(email: string): Promise<void> {
    await this.authRepository.resetPasswordByEmail(email);
  }
}
