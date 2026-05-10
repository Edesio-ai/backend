import { SupabaseInvitationTokenRow } from 'src/domain/auth/invitation.type';
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
});

class Fixtures {
  public readonly supabaseRow: SupabaseInvitationTokenRow = {
    id: 'token-1',
    establishment_id: 'est-1',
    token: 'abc',
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
