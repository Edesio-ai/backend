import {
  invitationTokenToSupabase,
  supabaseInvitationTokenToInvitationTokenPreview,
  supabaseSessionToAuthTokenData,
  supabaseSessionToAuthUser,
  SupabaseAuthUserToUser,
  supabaseValidatedTokenUserToUser,
} from './auth.mappers';
import { CreateInvitationTokenBody } from 'src/application/auth/create-invitation-token.use-case';
import { SupabaseInvitationToken } from 'src/domain/auth/invitation.type';
import { Session, SupabaseUser } from 'src/domain/auth/types/auth.type';

describe('auth.mappers', () => {
  describe('invitationTokenToSupabase', () => {
    it('maps create body to Supabase insert shape', () => {
      const expiresAt = new Date('2026-06-01T12:00:00.000Z');
      const body: CreateInvitationTokenBody = {
        establishmentId: 'est-1',
        token: 'tok',
        invitedEmail: 'inv@school.com',
        expiresAt,
        assignedChatbots: 3,
      };

      expect(invitationTokenToSupabase(body)).toEqual({
        establishment_id: 'est-1',
        token: 'tok',
        invited_email: 'inv@school.com',
        expires_at: expiresAt.toISOString(),
        assigned_chatbots: 3,
      });
    });
  });

  describe('supabaseSessionToAuthUser', () => {
    it('maps session payload to AuthUser', () => {
      const userSession = {
        id: 'u-1',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'a@b.com',
        email_confirmed_at: '2026-01-01T00:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {
          role: 'teacher',
          firstname: 'Ada',
          lastname: 'Lovelace',
          establishment: 'Acme',
          invitationToken: 'inv-xyz',
        },
        identities: [],
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        is_anonymous: false,
        confirmed_at: '2026-01-01T00:00:00.000Z',
        last_sign_in_at: '2026-01-01T00:00:00.000Z',
      };

      const data = {
        user: userSession,
        session: {
          access_token: 'at',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: '2099-01-01',
          refresh_token: 'rt',
          user: userSession,
          weak_password: null,
        },
      } as unknown as Session;

      expect(supabaseSessionToAuthUser(data)).toEqual({
        id: 'u-1',
        email: 'a@b.com',
        emailConfirmedAt: '2026-01-01T00:00:00.000Z',
        metadata: {
          role: 'teacher',
          firstname: 'Ada',
          lastname: 'Lovelace',
          establishment: 'Acme',
          invitationToken: 'inv-xyz',
        },
      });
    });
  });

  describe('supabaseSessionToAuthTokenData', () => {
    it('maps session to token data', () => {
      const userSession = {
        id: 'u-1',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'a@b.com',
        email_confirmed_at: '',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        identities: [],
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        is_anonymous: false,
        confirmed_at: '2026-01-01T00:00:00.000Z',
        last_sign_in_at: '2026-01-01T00:00:00.000Z',
      };

      const data = {
        user: userSession,
        session: {
          access_token: 'access',
          token_type: 'bearer',
          expires_in: 7200,
          expires_at: '2099-01-01',
          refresh_token: 'refresh',
          user: userSession,
          weak_password: null,
        },
      } as unknown as Session;

      expect(supabaseSessionToAuthTokenData(data)).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 7200,
      });
    });
  });

  describe('supabaseInvitationTokenToInvitationTokenPreview', () => {
    it('maps token row with establishment to preview', () => {
      const data = {
        establishment_id: 'est-1',
        expires_at: '2099-01-01T00:00:00.000Z',
        used_at: null,
        assigned_chatbots: 5,
        establishment: {
          id: 'est-1',
          supabase_user_id: 'owner-1',
          name: 'École',
          email: 'contact@ecole.com',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      } as unknown as SupabaseInvitationToken;

      expect(
        supabaseInvitationTokenToInvitationTokenPreview(
          data,
          'i***@school.com',
        ),
      ).toEqual({
        isValid: true,
        maskedEmail: 'i***@school.com',
        establishmentName: 'École',
        assignedChatbots: 5,
      });
    });
  });

  describe('supabaseValidatedTokenUserToUser', () => {
    it('maps JWT getUser payload to domain User with session-like metadata', () => {
      const user: SupabaseUser = {
        id: 'uid-jwt',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'jwt@example.com',
        email_confirmed_at: '2026-01-01T00:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {
          role: 'teacher',
          firstname: 'Marie',
          lastname: 'Curie',
          establishment: 'Lycée',
          invitationToken: 'tok-1',
        },
        identities: [],
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        is_anonymous: false,
      };

      expect(supabaseValidatedTokenUserToUser(user)).toEqual({
        id: 'uid-jwt',
        email: 'jwt@example.com',
        metadata: {
          role: 'teacher',
          firstname: 'Marie',
          lastname: 'Curie',
          establishment: 'Lycée',
          invitationToken: 'tok-1',
        },
      });
    });
  });

  describe('SupabaseAuthUserToUser', () => {
    it('maps Supabase user to domain User', () => {
      const user: SupabaseUser = {
        id: 'uid-1',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'user@example.com',
        email_confirmed_at: '2026-01-01T00:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {
          firstname: 'Jean',
          lastname: 'Dupont',
        },
        identities: [],
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        is_anonymous: false,
      };

      expect(SupabaseAuthUserToUser(user)).toEqual({
        id: 'uid-1',
        email: 'user@example.com',
        metadata: {
          firstname: 'Jean',
          lastname: 'Dupont',
        },
      });
    });
  });
});
