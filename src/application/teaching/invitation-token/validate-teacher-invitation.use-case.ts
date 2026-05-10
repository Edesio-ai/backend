import { Inject, Injectable } from '@nestjs/common';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/teacher/contracts/teacher.repository';
import {
  INVITATION_TOKEN_REPOSITORY,
  type IInvitationTokenRepository,
} from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { InvitationToken } from 'src/domain/auth/invitation.type';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';

@Injectable()
export class ValidateTeacherInvitationUseCase {
  constructor(
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly tokenRepository: IInvitationTokenRepository,
  ) {}

  async execute(
    userId: string,
    token: string,
  ): Promise<InvitationToken | null> {
    const teacher = await this.teacherRepository.getTeacherByUserId(userId);
    if (!teacher) {
      throw new NotFoundError(`Teacher with id ${userId} not found`);
    }

    if (teacher.establishmentId) {
      return null;
    }

    const invitation = await this.tokenRepository.getInvitationByToken(token);

    if (!invitation) {
      throw new NotFoundError('Invitation token not found');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      throw new BadRequestError('Invitation token expired');
    }

    if (invitation.usedAt) {
      throw new BadRequestError('Invitation token already used');
    }

    if (
      invitation.invitedEmail.toLowerCase() !== teacher.email?.toLowerCase()
    ) {
      throw new ForbiddenError(
        'Invitation email mismatch with the email provided',
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
