import { Inject, Injectable } from '@nestjs/common';

import { AUTH_REPOSITORY, type IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { RegisterBody, UserMetadata } from '../../domain/auth/types/auth.type';
import { EMAIL_PROVIDER, type IEmailProvider } from '../../domain/email/contract/i-email.interface';

import {
  type IInvitationTokenRepository,
  INVITATION_TOKEN_REPOSITORY,
} from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: ITeacherRepository,
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly invitationTokenRepository: IInvitationTokenRepository,
  ) {}

  async execute(body: RegisterBody): Promise<void> {
    const { role, email, password, firstname, lastname, acceptTerms, establishment, invitationToken } = body;

    const metadata: UserMetadata = {
      role,
      firstname,
      lastname,
      acceptTerms,
      invitationToken,
    };

    if (invitationToken) {
      return this.registerByInvitationToken(body, metadata);
    }

    if (role === 'student') {
      metadata.establishment = establishment;
    }

    await this.authRepository.createAuthUser(email, password, metadata);

    await this.emailProvider.sendWelcomeEmail(email, firstname, role);
  }

  private async registerByInvitationToken(body: RegisterBody, metadata: UserMetadata): Promise<void> {
    const { email, password, firstname, role, invitationToken } = body;

    const token = invitationToken ? await this.invitationTokenRepository.getInvitationByToken(invitationToken) : null;

    if (!token) {
      throw new BadRequestError('Invalid invitation token');
    }

    if (token.invitedEmail !== email) {
      throw new BadRequestError('Email mismatch');
    }

    const authUser = await this.authRepository.createAuthUser(email, password, metadata);

    if (token) {
      const teacher = await this.teacherRepository.createTeacherWithInvitationToken(authUser, token);
      await this.invitationTokenRepository.updateTokenUsedAt(token.id, teacher.id);
    }
    await this.emailProvider.sendWelcomeEmail(email, firstname, role);
    return;
  }
}
