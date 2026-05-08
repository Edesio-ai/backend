import { Inject } from '@nestjs/common';

import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from 'src/domain/teaching/interface/establishment.repository';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';

export class GetInvitationTokenUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(establishmentId: string): Promise<InvitationToken[]> {
    if (!establishmentId) {
      throw new NotFoundError('Establishment id not found');
    }
    const invitationTokens =
      await this.establishmentRepository.getInvitationTokenByEstablishmentId(
        establishmentId,
      );
    return invitationTokens;
  }
}
