import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

import { IAuthRepository } from '../../../../domain/auth/contracts/i-auth.repository';
import { TokenUserNotFoundError } from '../../../../domain/auth/errors/auth.errors';
import {
  AuthUserWithSession,
  SupabaseAuthSession,
  SupabaseUser,
  UpdateAuthUserPayload,
  User,
  UserMetadata,
} from '../../../../domain/auth/types/auth.type';
import { SUPABASE_AUTH } from '../../supabase-auth.module';
import { AuthMapper } from '../mappers/auth.mappers';
import { BadRequestError, ServerError, UnauthorizedError } from 'src/domain/shared/errors/global.errors';

@Injectable()
export class AuthSupabaseRepository implements IAuthRepository {
  constructor(@Inject(SUPABASE_AUTH) private readonly supabaseAuth: SupabaseClient) {}

  public async validateToken(token: string): Promise<User> {
    const { data, error } = await this.supabaseAuth.auth.getUser(token);
    if (error) {
      throw new TokenUserNotFoundError(error.message);
    }
    if (!data?.user) {
      throw new TokenUserNotFoundError('User not found');
    }
    return AuthMapper.SupabaseValidatedTokenUserToUser(data.user as unknown as SupabaseUser);
  }

  public async refreshSession(refreshToken: string): Promise<AuthUserWithSession> {
    const { data, error } = await this.supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new TokenUserNotFoundError(error?.message || 'Invalid or expired refresh token');
    }

    const session = {
      user: data.session.user,
      session: data.session,
    } as unknown as SupabaseAuthSession;

    return {
      authUser: AuthMapper.toAuthUser(session),
      session: AuthMapper.toAuthTokenData(session),
    };
  }

  public async logoutUser(accessToken: string): Promise<void> {
    const { error } = await this.supabaseAuth.auth.admin.signOut(accessToken, 'global');

    if (error) {
      throw new ServerError(error.message);
    }
    return;
  }

  public async loginUser(email: string, password: string): Promise<AuthUserWithSession> {
    const { data, error } = await this.supabaseAuth.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      throw new UnauthorizedError(error.message);
    }
    const session = data as unknown as SupabaseAuthSession;
    return {
      authUser: AuthMapper.toAuthUser(session),
      session: AuthMapper.toAuthTokenData(session),
    };
  }

  public async createAuthUser(email: string, password: string, metadata: UserMetadata): Promise<User> {
    const { data, error } = await this.supabaseAuth.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new BadRequestError('User already exists');
      }
      throw new ServerError(error.message);
    }

    if (!data.user) {
      throw new ServerError('User creation failed');
    }
    return AuthMapper.AuthUserToUser(data.user as unknown as SupabaseUser);
  }

  public async updateAuthUser(userId: string, payload: UpdateAuthUserPayload): Promise<void> {
    const { error } = await this.supabaseAuth.auth.admin.updateUserById(userId, AuthMapper.toUpdateAuthUser(payload));

    if (error) {
      console.error(`Error updating user ${userId}: ${error.message}`);
      throw new ServerError(error.message);
    }
  }

  public async deleteAuthUser(userId: string): Promise<void> {
    const { error } = await this.supabaseAuth.auth.admin.deleteUser(userId);
    const status = Number(error?.status);

    if (error && status !== 404) {
      console.error(`Error deleting auth user ${userId}: ${error.message}`);
      throw new ServerError(error.message);
    }
  }

  public async resetPasswordByEmail(email: string): Promise<void> {
    const { error } = await this.supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      console.error(`Error resetting password for email ${email}: ${error.message}`);
      throw new ServerError(error.message);
    }
  }

  public async existsUserByEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const users = await this.findAuthUsersByEmail(normalizedEmail);
    return users.some((user) => user.email?.toLowerCase() === normalizedEmail);
  }

  public async getAuthUserIdByEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = (await this.findAuthUsersByEmail(normalizedEmail)).find(
      (candidate) => candidate.email?.toLowerCase() === normalizedEmail,
    );

    return user?.id ?? null;
  }

  private async findAuthUsersByEmail(normalizedEmail: string): Promise<Array<{ id?: string; email?: string }>> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new ServerError('Supabase auth configuration is missing');
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(normalizedEmail)}`, {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    });

    if (!response.ok) {
      throw new ServerError(`Failed to fetch user by email: ${response.statusText}`);
    }

    const body = (await response.json()) as { users?: Array<{ id?: string; email?: string }> };
    return body.users ?? [];
  }
}
