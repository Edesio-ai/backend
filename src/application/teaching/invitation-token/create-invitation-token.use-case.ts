import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY, type IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';
import { EMAIL_PROVIDER, type IEmailProvider } from 'src/domain/email/contract/i-email.interface';
import {
  ESTABLISHMENT_REPOSITORY,
  type IEstablishmentRepository,
} from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import {
  INVITATION_TOKEN_REPOSITORY,
  type IInvitationTokenRepository,
} from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { InvitationEmailAlreadyRegisteredError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import { normalizeLocale, type Locale } from 'src/domain/shared/locale.type';

export type CreateInvitationTokenBody = {
  establishmentId: string;
  token: string;
  firstname: string;
  lastname: string;
  invitedEmail: string;
  expiresAt: Date;
  assignedChatbots: number;
  locale: Locale;
};

export class CreateInvitationTokenUseCase {
  constructor(
    @Inject(INVITATION_TOKEN_REPOSITORY)
    private readonly invitationTokenRepository: IInvitationTokenRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
  ) {}

  async execute(body: CreateInvitationTokenBody): Promise<void> {
    const { invitedEmail, establishmentId, token, assignedChatbots, locale } = body;

    const emailAlreadyRegistered = await this.authRepository.existsUserByEmail(invitedEmail);

    if (emailAlreadyRegistered) {
      throw new InvitationEmailAlreadyRegisteredError();
    }

    const establishment = await this.establishmentRepository.getEstablishmentById(establishmentId);

    if (!establishment) {
      throw new NotFoundError('Establishment not found');
    }

    await this.invitationTokenRepository.createInvitationToken(body);

    await this.emailProvider.sendTeacherInvitation(
      invitedEmail,
      establishment.name,
      token,
      assignedChatbots,
      normalizeLocale(locale),
    );
  }
}
