import { InvitationTokenPreview, SupabaseInvitationTokenRow } from 'src/domain/auth/invitation.type';
import { CreateInvitationTokenBody } from 'src/application/teaching/invitation-token/create-invitation-token.use-case';
import { invitationTokenMapper } from './invitation-token.mapper';

describe('invitationTokenMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toDomain', () => {
    it('maps invitation_tokens row to InvitationToken', () => {
      const result = fixtures.whenToDomain();

      fixtures.thenReturnsExpectedInvitationToken(result);
    });
  });

  describe('toInsert', () => {
    it('maps create body to Supabase insert shape', () => {
      const expiresAt = new Date('2026-06-01T12:00:00.000Z');
      const body: CreateInvitationTokenBody = {
        establishmentId: 'est-1',
        token: 'tok',
        firstname: 'Camille',
        lastname: 'Bernard',
        invitedEmail: 'inv@school.com',
        expiresAt,
        assignedChatbots: 3,
        locale: 'fr',
      };

      expect(invitationTokenMapper.toInsert(body)).toEqual({
        establishment_id: 'est-1',
        token: 'tok',
        firstname: 'Camille',
        lastname: 'Bernard',
        invited_email: 'inv@school.com',
        expires_at: expiresAt.toISOString(),
        assigned_chatbots: 3,
      });
    });
  });

  describe('toPreview', () => {
    it('maps embedded establishment object', () => {
      const result = invitationTokenMapper.toPreview(
        { assigned_chatbots: 3, establishment: { name: 'Lycée X' } },
        't***r@school.fr',
      );

      const expected: InvitationTokenPreview = {
        isValid: true,
        maskedEmail: 't***r@school.fr',
        establishmentName: 'Lycée X',
        assignedChatbots: 3,
      };
      expect(result).toEqual(expected);
    });

    it('uses first row when establishment is an array', () => {
      const result = invitationTokenMapper.toPreview(
        {
          assigned_chatbots: 1,
          establishment: [{ name: 'Collège Y' }, { name: 'ignored' }],
        },
        'a@b.c',
      );

      expect(result.establishmentName).toBe('Collège Y');
      expect(result.assignedChatbots).toBe(1);
    });

    it('handles missing establishment', () => {
      const result = invitationTokenMapper.toPreview({ assigned_chatbots: 2, establishment: null }, 'x');

      expect(result.establishmentName).toBe('');
      expect(result.assignedChatbots).toBe(2);
    });
  });
});

class Fixtures {
  public readonly supabaseRow: SupabaseInvitationTokenRow = {
    id: 'token-1',
    establishment_id: 'est-1',
    token: 'abc',
    firstname: 'Camille',
    lastname: 'Bernard',
    invited_email: 'teacher@school.com',
    expires_at: '2026-04-01T00:00:00.000Z',
    used_at: null,
    used_by: null,
    created_at: '2026-03-28T00:00:00.000Z',
    assigned_chatbots: 2,
  };

  public readonly expectedInvitationToken = {
    id: 'token-1',
    establishmentId: 'est-1',
    token: 'abc',
    firstname: 'Camille',
    lastname: 'Bernard',
    invitedEmail: 'teacher@school.com',
    expiresAt: '2026-04-01T00:00:00.000Z',
    usedAt: null,
    usedBy: null,
    createdAt: '2026-03-28T00:00:00.000Z',
    assignedChatbots: 2,
  };

  whenToDomain() {
    return invitationTokenMapper.toDomain(this.supabaseRow);
  }

  thenReturnsExpectedInvitationToken(result: unknown) {
    expect(result).toEqual(this.expectedInvitationToken);
  }
}
