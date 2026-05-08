import { Inject, Injectable } from '@nestjs/common';

import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from 'src/domain/auth/contract/auth.repository';
import { InvitationTokenPreview } from 'src/domain/auth/invitation.type';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';

@Injectable()
export class GetInvitationPreviewUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(token: string): Promise<InvitationTokenPreview> {
    if (!token) {
      throw new NotFoundError('Invitation token not found');
    }

    const invitationTokenPreview =
      await this.authRepository.getInvitationPreview(token);
    return invitationTokenPreview;
  }
}
