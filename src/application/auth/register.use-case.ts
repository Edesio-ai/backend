import { Inject, Injectable } from '@nestjs/common';

import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from '../../domain/auth/contract/auth.repository';
import { RegisterBody, UserMetadata } from '../../domain/auth/types/auth.type';
import {
  EMAIL_PROVIDER,
  type EmailProviderInterface,
} from '../../domain/email/contract/email.interface';
import {
  TEACHER_REPOSITORY,
  type TeacherRepository,
} from 'src/domain/teaching/interfaces/teacher.repository';
import {
  type IInvitationTokenRepository,
  INVITATION_TOKEN_REPOSITORY,
} from 'src/domain/token/contract/token.repository';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProviderInterface,
    @Inject(TEACHER_REPOSITORY)
    private readonly teacherRepository: TeacherRepository,
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly invitationTokenRepository: IInvitationTokenRepository,
  ) {}

  async execute(body: RegisterBody): Promise<void> {
    const {
      role,
      email,
      password,
      firstname,
      lastname,
      acceptTerms,
      establishment,
      invitationToken,
    } = body;

    const metadata: UserMetadata = {
      role,
      firstname,
      lastname,
      acceptTerms,
      invitationToken,
    };

    if (role === 'student') {
      metadata.establishment = establishment;
    }

    const authUser = await this.authRepository.createAuthUser(
      email,
      password,
      metadata,
    );
    if (metadata.invitationToken) {
      const teacher =
        await this.teacherRepository.createTeacherWithInvitationToken(
          authUser,
          metadata.invitationToken,
        );
      await this.invitationTokenRepository.updateTokenUsedAt(
        metadata.invitationToken.id,
        teacher.id,
      );
    }
    await this.emailProvider.sendWelcomeEmail(email, firstname, role);

    return;
  }
}
