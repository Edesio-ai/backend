import { Inject, Injectable } from '@nestjs/common';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interface/teacher.repository';
import { TeacherNotFoundError } from 'src/domain/teaching/error';
import {
  TOKEN_REPOSITORY,
  type TokenRepository,
} from 'src/domain/token/contract/token.repository';
import {
  InvitationTokenAlreadyUsedError,
  InvitationTokenEmailMismatchError,
  InvitationTokenExpiredError,
  InvitationTokenNotFoundError,
} from 'src/domain/auth/errors/auth.errors';
import { InvitationToken } from 'src/domain/auth/invitation.type';

@Injectable()
export class ValidateTeacherInvitationUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: TokenRepository,
  ) {}

  async execute(
    userId: string,
    token: string,
  ): Promise<InvitationToken | null> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new TeacherNotFoundError();
    }

    if (teacher.establishmentId) {
      return null;
    }

    const invitation = await this.tokenRepository.getInvitationByToken(token);

    if (!invitation) {
      throw new InvitationTokenNotFoundError('Invitation token not found');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      throw new InvitationTokenExpiredError('Invitation token expired');
    }

    if (invitation.usedAt) {
      throw new InvitationTokenAlreadyUsedError(
        'Invitation token already used',
      );
    }

    if (
      invitation.invitedEmail.toLowerCase() !== teacher.email?.toLowerCase()
    ) {
      throw new InvitationTokenEmailMismatchError(
        'Invitation email mismatch with the teacher provided',
      );
    }

    await this.tokenRepository.markInvitationTokenAsUsed(
      invitation.id,
      teacher.id,
    );
    await this.teacherRepository.linkTeacherToEstablishment(
      invitation.id,
      teacher.id,
      invitation.establishmentId,
    );

    return invitation;
  }
}
