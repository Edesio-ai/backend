import { Inject, Injectable } from '@nestjs/common';

import { AUTH_REPOSITORY, type IAuthRepository } from '../../domain/auth/contracts/i-auth.repository';
import { RegisterBody, RegisterEstablishmentBody, UserMetadata } from '../../domain/auth/types/auth.type';
import { EMAIL_PROVIDER, type IEmailProvider } from '../../domain/email/contract/i-email.interface';

import {
  type IInvitationTokenRepository,
  INVITATION_TOKEN_REPOSITORY,
} from 'src/domain/invitation-token/contract/i-invtiation-token.repository';
import { TEACHER_REPOSITORY, type ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { BadRequestError } from 'src/domain/shared/errors/global.errors';
import { normalizeLocale } from 'src/domain/shared/locale.type';
import {
  ESTABLISHMENT_REPOSITORY,
  type IEstablishmentRepository,
} from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import { EstablishmentWithContact } from 'src/domain/teaching/establishment/types/establishment.type';

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
    @Inject(ESTABLISHMENT_REPOSITORY)
    private readonly establishmentRepository: IEstablishmentRepository,
  ) {}

  async execute(body: RegisterBody | RegisterEstablishmentBody): Promise<EstablishmentWithContact | void> {
    // TODO: Rework this endpoint to uniformize the registration process for all roles
    if (body.role === 'establishment') {
      const metadata: UserMetadata = {
        role: body.role,
        firstname: body.contact.firstname,
        lastname: body.contact.lastname,
        acceptTerms: body.contact.acceptTerms,
      };

      const user = await this.authRepository.createAuthUser(body.contact.email, body.contact.password, metadata);

      if (!user) {
        throw new BadRequestError('User not created');
      }

      const establishment = await this.establishmentRepository.createEstablishment({
        supabaseUserId: user.id,
        name: body.name,
        email: user.email,
        type: body.type,
        address: body.address,
      });
      await this.emailProvider.sendWelcomeEmail(
        user.email,
        body.contact.firstname,
        body.role,
        normalizeLocale(body.locale),
      );

      return {
        ...establishment,
        contact: {
          email: user.email,
          firstname: body.contact.firstname,
          lastname: body.contact.lastname,
        },
      };
    }

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

    await this.emailProvider.sendWelcomeEmail(email, firstname, role, normalizeLocale(body.locale));
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

    await this.emailProvider.sendWelcomeEmail(email, firstname, role, normalizeLocale(body.locale));
    return;
  }
}
