import { Inject } from '@nestjs/common';

import {
  ESTABLISHMENT_REPOSITORY,
  type EstablishmentRepository,
} from '../../interfaces/persistence/establishment.repository';
import { InvitationToken } from '../../domain/auth/invitation.type';
import { EstablishmentIdNotFoundError } from '../../domain/establishment/error';

export class GetInvitationTokenUseCase {
  constructor(
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(establishmentId: string): Promise<InvitationToken[]> {
    if (!establishmentId) {
      throw new EstablishmentIdNotFoundError();
    }
    const invitationTokens =
      await this.establishmentRepository.getInvitationTokenByEstablishmentId(
        establishmentId,
      );
    return invitationTokens;
  }
}
