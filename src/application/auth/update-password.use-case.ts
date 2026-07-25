import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY, type IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';

export class UpdatePasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(userId: string, password: string): Promise<void> {
    await this.authRepository.updateAuthUser(userId, { password });
    return;
  }
}
