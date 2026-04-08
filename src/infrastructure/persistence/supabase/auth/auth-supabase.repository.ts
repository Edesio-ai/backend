import { Inject, Injectable } from '@nestjs/common';

import { AuthRepository } from '../../../../interfaces/persistence/auth.repository';
import { SUPABASE_ADMIN } from '../supabase.module';
import {
  InvitationToken,
  InvitationTokenPreview,
} from '../../../../domain/auth/invitation.type';
import {
  InvitationTokenAlreadyUsedError,
  InvitationTokenEmailMismatchError,
  InvitationTokenExpiredError,
  InvitationTokenNotFoundError,
  UserAlereadyExistsError,
  UserCreationError,
  UserCreationFailedError,
  TeacherProfileCreationError,
  TokenUpdateError,
  UserLoginError,
  TokenUserNotFoundError,
  LogoutError,
  InvitationTokenCreationError,
} from '../../../../domain/auth/errors';
import { User, Session } from '../../../../domain/auth/auth.type';
import { Teacher } from '../../../../domain/teaching/teacher.type';
import { UserMetadata } from '../../../../domain/auth/auth.type';
import { SUPABASE_AUTH } from '../supabase-auth.module';

@Injectable()
export class AuthSupabaseRepository implements AuthRepository {
  constructor(
    @Inject(SUPABASE_AUTH) private readonly supabaseAuth: any,
    @Inject(SUPABASE_ADMIN) private readonly supabaseAdmin: any,
  ) {}

  public async validateToken(token: string): Promise<User> {
    const { data, error } = await this.supabaseAuth.auth.getUser(token);
    if (error) {
      throw new TokenUserNotFoundError(error.message);
    }
    return data.user;
  }

  public async createInvitationToken(
    establishmentId: string,
    token: string,
    invitedEmail: string,
    expiresAt: Date,
    assignedChatbots: number,
  ): Promise<void> {
    const { error } = await this.supabaseAuth
      .from('invitation_tokens')
      .insert({
        establishment_id: establishmentId,
        token,
        invited_email: invitedEmail.toLowerCase().trim(),
        expires_at: expiresAt.toISOString(),
        assigned_chatbots: assignedChatbots,
      })
      .select()
      .single();

    if (error) {
      throw new InvitationTokenCreationError(error.message);
    }

    return;
  }

  public async logoutUser(accessToken: string): Promise<void> {
    const { error } = await this.supabaseAuth.auth.admin.signOut(
      accessToken,
      'global',
    );

    if (error) {
      throw new LogoutError(error.message);
    }
    return;
  }

  public async loginUser(email: string, password: string): Promise<Session> {
    const { data, error } = await this.supabaseAuth.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      throw new UserLoginError(error.message);
    }

    return data;
  }

  public async getInvitationPreview(
    token: string,
  ): Promise<InvitationTokenPreview> {
    const { data, error } = await this.supabaseAdmin
      .from('invitation_tokens')
      .select(
        `
                id,
                invited_email,
                assigned_chatbots,
                expires_at,
                used_at,
                establishment:establishment!invitation_tokens_establishment_id_fkey ( name )
            `,
      )
      .eq('token', token)
      .single();

    if (!data || error) {
      throw new InvitationTokenNotFoundError(error?.message);
    }

    if (data.used_at) {
      throw new InvitationTokenAlreadyUsedError();
    }

    const expiresAt = new Date(data.expires_at);

    if (expiresAt < new Date()) {
      throw new InvitationTokenExpiredError();
    }

    const maskedEmail = this.maskEmail(data.invited_email);

    return {
      isValid: true,
      maskedEmail: maskedEmail,
      establishmentName: data.establishment.name,
      assignedChatbots: data.assigned_chatbots,
    };
  }

  public async valideInvitationToken(
    token: string,
    email: string,
  ): Promise<InvitationToken> {
    const { data, error } = await this.supabaseAdmin
      .from('invitation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      throw new InvitationTokenNotFoundError(error?.message);
    }

    if (data.used_at) {
      throw new InvitationTokenAlreadyUsedError();
    }

    const expiresAt = new Date(data.expires_at);

    if (expiresAt < new Date()) {
      throw new InvitationTokenExpiredError();
    }

    if (data.invited_email.toLowerCase() !== email.toLowerCase().trim()) {
      throw new InvitationTokenEmailMismatchError();
    }

    return data;
  }

  public async createUser(
    email: string,
    password: string,
    metadata: UserMetadata,
    invitationToken?: InvitationToken,
  ): Promise<void> {
    const authUser = await this.createAuthUser(email, password, metadata);
    if (invitationToken) {
      const teacher = await this.createTeacherWithInvitationTokenProfile(
        authUser,
        invitationToken,
      );
      await this.updateTokenUsedAt(invitationToken.id, teacher.id);
    }
  }

  private async createAuthUser(
    email: string,
    password: string,
    metadata: UserMetadata,
  ): Promise<User> {
    const { data, error } = await this.supabaseAuth.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new UserAlereadyExistsError();
      }
      throw new UserCreationError(error.message);
    }

    if (!data.user) {
      throw new UserCreationFailedError();
    }
    return data.user;
  }

  private async createTeacherWithInvitationTokenProfile(
    adminData: User,
    invitationToken: InvitationToken,
  ): Promise<Teacher> {
    const { firstname, lastname } = adminData.user_metadata;
    const email = adminData.email;

    const { data, error } = await this.supabaseAdmin
      .from('teachers')
      .insert({
        supabase_user_id: adminData.id,
        name: `${firstname} ${lastname}`,
        email: email.toLowerCase().trim(),
        establishment_id: invitationToken.establishment_id,
        available_chatbots: invitationToken.assigned_chatbots || 0,
      })
      .select()
      .single();

    if (error) {
      await this.supabaseAuth.auth.admin.deleteUser(adminData.id);
      throw new TeacherProfileCreationError(error.message);
    }

    return data;
  }

  private async updateTokenUsedAt(
    tokenId: string,
    teacherId: string,
  ): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('invitation_tokens')
      .update({
        used_at: new Date().toISOString(),
        used_by: teacherId,
      })
      .eq('id', tokenId)
      .is('used_at', null);

    if (error) {
      throw new TokenUpdateError(error.message);
    }
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***';
    if (localPart.length <= 2) {
      return `${'*'.repeat(localPart.length)}@${domain}`;
    }
    const visibleStart = localPart[0];
    const visibleEnd = localPart[localPart.length - 1];
    const hidden = '*'.repeat(localPart.length - 2);
    return `${visibleStart}${hidden}${visibleEnd}@${domain}`;
  }
}
