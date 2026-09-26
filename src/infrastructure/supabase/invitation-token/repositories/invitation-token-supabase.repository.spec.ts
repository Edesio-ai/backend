import { InvitationTokenSupabaseRepository } from './invtiation-token-supabase.repository';
import { BadRequestError, ServerError } from 'src/domain/shared/errors/global.errors';

describe('InvitationTokenSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete invitation token when query succeeds', async () => {
    fixtures.whenSupabaseDeleteSucceeds();

    await fixtures.whenDeleteInvitationToken();

    fixtures.thenQueryBuiltWithExpectedArguments();
  });

  it('should throw ServerError when query fails', async () => {
    fixtures.whenSupabaseDeleteFails();

    const promise = fixtures.whenDeleteInvitationToken();

    await fixtures.thenThrowServerError(promise);
    fixtures.thenQueryBuiltWithExpectedArguments();
  });

  it('should return invitation by token', async () => {
    fixtures.whenGetInvitationByTokenSucceeds();

    const result = await fixtures.whenGetInvitationByToken();

    fixtures.thenGetInvitationByTokenQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedInvitation(result);
  });

  it('should throw ServerError when get invitation by token fails', async () => {
    fixtures.whenGetInvitationByTokenFails();

    const promise = fixtures.whenGetInvitationByToken();

    await fixtures.thenThrowServerError(promise);
    fixtures.thenGetInvitationByTokenQueryBuiltWithExpectedArguments();
  });

  it('should mark invitation token as used', async () => {
    fixtures.whenMarkInvitationTokenAsUsedSucceeds();

    await fixtures.whenMarkInvitationTokenAsUsed();

    fixtures.thenMarkInvitationTokenAsUsedQueryBuiltWithExpectedArguments();
  });

  it('should throw BadRequestError when mark as used fails', async () => {
    fixtures.whenMarkInvitationTokenAsUsedFails();

    const promise = fixtures.whenMarkInvitationTokenAsUsed();

    await fixtures.thenThrowBadRequestError(promise);
    fixtures.thenMarkInvitationTokenAsUsedQueryBuiltWithExpectedArguments();
  });

  it('should return invitation tokens by establishment id when query succeeds', async () => {
    fixtures.whenGetInvitationTokenByEstablishmentIdSucceeds();

    const result = await fixtures.whenGetInvitationTokenByEstablishmentId();

    fixtures.thenGetInvitationTokenByEstablishmentIdQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedInvitationTokensByEstablishment(result);
  });

  it('should return empty array when establishment has no invitation tokens', async () => {
    fixtures.whenGetInvitationTokenByEstablishmentIdReturnsEmpty();

    const result = await fixtures.whenGetInvitationTokenByEstablishmentId();

    fixtures.thenGetInvitationTokenByEstablishmentIdQueryBuiltWithExpectedArguments();
    expect(result).toEqual([]);
  });

  it('should throw ServerError when get invitation tokens by establishment id fails', async () => {
    fixtures.whenGetInvitationTokenByEstablishmentIdFails();

    const promise = fixtures.whenGetInvitationTokenByEstablishmentId();

    await fixtures.thenThrowServerError(promise);
    fixtures.thenGetInvitationTokenByEstablishmentIdQueryBuiltWithExpectedArguments();
  });
});

class Fixtures {
  public readonly token = 'token-id-1';
  public readonly invitationToken = 'plain-token';
  public readonly invitationTokenId = 'invitation-id-1';
  public readonly teacherId = 'teacher-1';
  public readonly queryErrorMessage = 'delete failed';
  public readonly invitationSupabaseRow = {
    id: this.invitationTokenId,
    establishment_id: 'est-1',
    token: this.invitationToken,
    firstname: 'Camille',
    lastname: 'Bernard',
    invited_email: 'teacher@school.com',
    expires_at: '2099-01-01T00:00:00.000Z',
    used_at: null,
    used_by: null,
    created_at: '2026-01-01T00:00:00.000Z',
    assigned_chatbots: 2,
  };
  public readonly expectedInvitation = {
    id: this.invitationTokenId,
    establishmentId: 'est-1',
    token: this.invitationToken,
    firstname: 'Camille',
    lastname: 'Bernard',
    invitedEmail: 'teacher@school.com',
    expiresAt: '2099-01-01T00:00:00.000Z',
    usedAt: null,
    usedBy: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    assignedChatbots: 2,
  };

  public readonly establishmentId = 'est-1';
  public readonly invitationSupabaseRowNewer = {
    ...this.invitationSupabaseRow,
    id: 'invitation-id-2',
    created_at: '2026-01-03T00:00:00.000Z',
  };
  public readonly expectedInvitationsByEstablishment = [
    {
      id: 'invitation-id-2',
      establishmentId: 'est-1',
      token: this.invitationToken,
      firstname: 'Camille',
      lastname: 'Bernard',
      invitedEmail: 'teacher@school.com',
      expiresAt: '2099-01-01T00:00:00.000Z',
      usedAt: null,
      usedBy: null,
      createdAt: '2026-01-03T00:00:00.000Z',
      assignedChatbots: 2,
    },
    this.expectedInvitation,
  ];

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

  private readonly listOrderMock = jest.fn();
  private readonly listEqMock = jest.fn(() => ({ order: this.listOrderMock }));
  private readonly listSelectMock = jest.fn(() => ({ eq: this.listEqMock }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table !== 'invitation_tokens') return {};
    if (this.mode === 'delete') return { delete: this.deleteMock };
    if (this.mode === 'get') return { select: this.getSelectMock };
    if (this.mode === 'mark') return { update: this.markUpdateMock };
    if (this.mode === 'listEstablishment') return { select: this.listSelectMock };
    return {};
  });
  private mode: 'delete' | 'get' | 'mark' | 'listEstablishment' = 'delete';

  public readonly repository: InvitationTokenSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new InvitationTokenSupabaseRepository(supabaseMock as never);
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
    return this.repository.markInvitationTokenAsUsed(this.invitationTokenId, this.teacherId);
  }

  whenGetInvitationTokenByEstablishmentId() {
    this.mode = 'listEstablishment';
    return this.repository.getInvitationTokenByEstablishmentId(this.establishmentId);
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
      data: this.invitationSupabaseRow,
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
      data: this.invitationSupabaseRow,
      error: null,
    });
  }

  whenMarkInvitationTokenAsUsedFails() {
    this.markSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'update failed' },
    });
  }

  whenGetInvitationTokenByEstablishmentIdSucceeds() {
    this.listOrderMock.mockResolvedValue({
      data: [this.invitationSupabaseRowNewer, this.invitationSupabaseRow],
      error: null,
    });
  }

  whenGetInvitationTokenByEstablishmentIdReturnsEmpty() {
    this.listOrderMock.mockResolvedValue({
      data: [],
      error: null,
    });
  }

  whenGetInvitationTokenByEstablishmentIdFails() {
    this.listOrderMock.mockResolvedValue({
      data: null,
      error: { message: 'list query failed' },
    });
  }

  async thenThrowServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
  }

  async thenThrowBadRequestError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(BadRequestError);
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
    expect(result).toEqual(this.expectedInvitation);
  }

  thenGetInvitationTokenByEstablishmentIdQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.listSelectMock).toHaveBeenCalledWith('*');
    expect(this.listEqMock).toHaveBeenCalledWith('establishment_id', this.establishmentId);
    expect(this.listOrderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(this.listOrderMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedInvitationTokensByEstablishment(result: unknown) {
    expect(result).toEqual(this.expectedInvitationsByEstablishment);
  }
}
