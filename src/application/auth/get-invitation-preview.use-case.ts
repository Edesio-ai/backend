import { Inject, Injectable } from '@nestjs/common';

import { AUTH_REPOSITORY, type AuthRepository } from '../../interfaces/persistence/auth.repository';
import { InvitationTokenPreview } from '../../domain/auth/invitation.type';
import { InvitationTokenNotFoundError } from '../../domain/auth/errors';

@Injectable()
export class GetInvitationPreviewUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(token: string): Promise<InvitationTokenPreview> {
    if (!token) {
      throw new InvitationTokenNotFoundError();
    }

    const invitationTokenPreview = await this.authRepository.getInvitationPreview(token);
    return invitationTokenPreview;
  }
}