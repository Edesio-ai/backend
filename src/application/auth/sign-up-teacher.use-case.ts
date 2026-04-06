import { Inject, Injectable } from '@nestjs/common';

import { UserMetadata } from '../../domain/auth/auth.type';
import { SignUpTeacherBody } from '../../domain/auth/auth.type';
import {
  AUTH_REPOSITORY,
  type AuthRepository,
} from '../../interfaces/persistence/auth.repository';
import { InvitationToken } from '../../domain/auth/invitation.type';
import {
  EMAIL_PROVIDER,
  type EmailProviderInterface,
} from '../../interfaces/mailer/email.provider';

@Injectable()
export class SignUpTeacherUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProviderInterface,
  ) {}

  async execute(body: SignUpTeacherBody): Promise<void> {
    const { token, email, password, firstname, lastname } = body;
    const role = 'teacher';

    const metadata: UserMetadata = {
      role,
      firstname,
      lastname,
    };

    const invitationToken: InvitationToken =
      await this.authRepository.valideInvitationToken(token, email);
    await this.authRepository.createUser(
      email,
      password,
      metadata,
      invitationToken,
    );
    await this.emailProvider.sendWelcomeEmail(email, firstname, role);

    return;
  }
}
