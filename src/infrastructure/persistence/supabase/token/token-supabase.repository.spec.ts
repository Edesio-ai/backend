import { TokenSupabaseRepository } from './token-supabase.repository';
import { ServerTokenError } from '../../../../domain/token/token.error';
import { InvitationTokenBadRequestError } from 'src/domain/auth/errors/auth.errors';

describe('TokenSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete invitation token when query succeeds', async () => {
    fixtures.whenSupabaseDeleteSucceeds();

    await fixtures.whenDeleteInvitationToken();

    fixtures.thenQueryBuiltWithExpectedArguments();
  });

  it('should throw ServerTokenError when query fails', async () => {
    fixtures.whenSupabaseDeleteFails();

    const promise = fixtures.whenDeleteInvitationToken();

    await fixtures.thenThrowServerTokenError(promise);
    fixtures.thenQueryBuiltWithExpectedArguments();
  });

  it('should return invitation by token', async () => {
    fixtures.whenGetInvitationByTokenSucceeds();

    const result = await fixtures.whenGetInvitationByToken();

    fixtures.thenGetInvitationByTokenQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedInvitation(result);
  });

  it('should throw ServerTokenError when get invitation by token fails', async () => {
    fixtures.whenGetInvitationByTokenFails();

    const promise = fixtures.whenGetInvitationByToken();

    await fixtures.thenThrowServerTokenError(promise);
    fixtures.thenGetInvitationByTokenQueryBuiltWithExpectedArguments();
  });

  it('should mark invitation token as used', async () => {
    fixtures.whenMarkInvitationTokenAsUsedSucceeds();

    await fixtures.whenMarkInvitationTokenAsUsed();

    fixtures.thenMarkInvitationTokenAsUsedQueryBuiltWithExpectedArguments();
  });

  it('should throw InvitationTokenBadRequestError when mark as used fails', async () => {
    fixtures.whenMarkInvitationTokenAsUsedFails();

    const promise = fixtures.whenMarkInvitationTokenAsUsed();

    await fixtures.thenThrowInvitationTokenBadRequestError(promise);
    fixtures.thenMarkInvitationTokenAsUsedQueryBuiltWithExpectedArguments();
  });
});

class Fixtures {
  public readonly token = 'token-id-1';
  public readonly invitationToken = 'plain-token';
  public readonly invitationTokenId = 'invitation-id-1';
  public readonly teacherId = 'teacher-1';
  public readonly queryErrorMessage = 'delete failed';
  public readonly invitation = {
    id: this.invitationTokenId,
    establishment_id: 'est-1',
    token: this.invitationToken,
    invited_email: 'teacher@school.com',
    expires_at: '2099-01-01T00:00:00.000Z',
    used_at: null,
    used_by: null,
    created_at: '2026-01-01T00:00:00.000Z',
    assigned_chatbots: 2,
  };

  private readonly eqMock = jest.fn();
  private readonly deleteMock = jest.fn(() => ({ eq: this.eqMock }));
  private readonly getSingleMock = jest.fn();
  private readonly getEqMock = jest.fn(() => ({ single: this.getSingleMock }));
  private readonly getSelectMock = jest.fn(() => ({ eq: this.getEqMock }));

  private readonly markSingleMock = jest.fn();
  private readonly markSelectMock = jest.fn(() => ({
    single: this.markSingleMock,
  }));
  private readonly markIsMock = jest.fn(() => ({
    select: this.markSelectMock,
  }));
  private readonly markEqMock = jest.fn(() => ({ is: this.markIsMock }));
  private readonly markUpdateMock = jest.fn(() => ({ eq: this.markEqMock }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table !== 'invitation_tokens') return {};
    if (this.mode === 'delete') return { delete: this.deleteMock };
    if (this.mode === 'get') return { select: this.getSelectMock };
    if (this.mode === 'mark') return { update: this.markUpdateMock };
    return {};
  });
  private mode: 'delete' | 'get' | 'mark' = 'delete';

  public readonly repository: TokenSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new TokenSupabaseRepository(supabaseMock as never);
  }

  whenDeleteInvitationToken() {
    this.mode = 'delete';
    return this.repository.deleteInvitationToken(this.token);
  }

  whenGetInvitationByToken() {
    this.mode = 'get';
    return this.repository.getInvitationByToken(this.invitationToken);
  }

  whenMarkInvitationTokenAsUsed() {
    this.mode = 'mark';
    return this.repository.markInvitationTokenAsUsed(
      this.invitationTokenId,
      this.teacherId,
    );
  }

  whenSupabaseDeleteSucceeds() {
    this.eqMock.mockResolvedValue({
      error: null,
    });
  }

  whenSupabaseDeleteFails() {
    this.eqMock.mockResolvedValue({
      error: { message: this.queryErrorMessage },
    });
  }

  whenGetInvitationByTokenSucceeds() {
    this.getSingleMock.mockResolvedValue({
      data: this.invitation,
      error: null,
    });
  }

  whenGetInvitationByTokenFails() {
    this.getSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'select failed' },
    });
  }

  whenMarkInvitationTokenAsUsedSucceeds() {
    this.markSingleMock.mockResolvedValue({
      data: this.invitation,
      error: null,
    });
  }

  whenMarkInvitationTokenAsUsedFails() {
    this.markSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'update failed' },
    });
  }

  async thenThrowServerTokenError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerTokenError);
  }

  async thenThrowInvitationTokenBadRequestError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(
      InvitationTokenBadRequestError,
    );
  }

  thenQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.deleteMock).toHaveBeenCalledWith();
    expect(this.eqMock).toHaveBeenCalledWith('id', this.token);
    expect(this.eqMock).toHaveBeenCalledTimes(1);
  }

  thenGetInvitationByTokenQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.getSelectMock).toHaveBeenCalledWith('*');
    expect(this.getEqMock).toHaveBeenCalledWith('token', this.invitationToken);
    expect(this.getSingleMock).toHaveBeenCalledTimes(1);
  }

  thenMarkInvitationTokenAsUsedQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.markUpdateMock).toHaveBeenCalledWith({
      used_at: expect.any(String),
      used_by: this.teacherId,
    });
    expect(this.markEqMock).toHaveBeenCalledWith('id', this.invitationTokenId);
    expect(this.markIsMock).toHaveBeenCalledWith('used_at', null);
    expect(this.markSelectMock).toHaveBeenCalledTimes(1);
    expect(this.markSingleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedInvitation(result: unknown) {
    expect(result).toEqual(this.invitation);
  }
}
