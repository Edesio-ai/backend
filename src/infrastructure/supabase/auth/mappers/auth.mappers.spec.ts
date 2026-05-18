import { AuthMapper } from './auth.mappers';
import { Session, SupabaseUser } from 'src/domain/auth/types/auth.type';

describe('AuthMapper', () => {
  describe('toAuthUser', () => {
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

      expect(AuthMapper.toAuthUser(data)).toEqual({
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

  describe('toAuthTokenData', () => {
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

      expect(AuthMapper.toAuthTokenData(data)).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 7200,
      });
    });
  });

  describe('SupabaseValidatedTokenUserToUser', () => {
    it('maps JWT getUser payload to domain User metadata', () => {
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
        },
        identities: [],
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        is_anonymous: false,
      };

      expect(AuthMapper.SupabaseValidatedTokenUserToUser(user)).toEqual({
        id: 'uid-jwt',
        email: 'jwt@example.com',
        emailConfirmedAt: '2026-01-01T00:00:00.000Z',
        metadata: {
          role: 'teacher',
          firstname: 'Marie',
          lastname: 'Curie',
        },
      });
    });
  });

  describe('AuthUserToUser', () => {
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

      expect(AuthMapper.AuthUserToUser(user)).toEqual({
        id: 'uid-1',
        email: 'user@example.com',
        metadata: {
          firstname: 'Jean',
          lastname: 'Dupont',
        },
      });
    });
  });

  describe('toUpdateAuthUser', () => {
    it('maps password only', () => {
      expect(AuthMapper.toUpdateAuthUser({ password: 'NewSecure1!' })).toEqual({
        password: 'NewSecure1!',
      });
    });

    it('maps email and user_metadata when provided', () => {
      expect(
        AuthMapper.toUpdateAuthUser({
          email: 'x@y.com',
          metadata: { firstname: 'A', role: 'teacher' },
        }),
      ).toEqual({
        email: 'x@y.com',
        user_metadata: { firstname: 'A', role: 'teacher' },
      });
    });

    it('returns empty object when no recognized fields are set', () => {
      expect(AuthMapper.toUpdateAuthUser({})).toEqual({});
    });
  });
});
