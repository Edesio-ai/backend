import { Inject } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from '../../domain/auth/contracts/i-auth.repository';

export class LogoutUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(accessToken: string): Promise<void> {
    await this.authRepository.logoutUser(accessToken);
    return;
  }
}
