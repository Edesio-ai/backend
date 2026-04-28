import { EstablishmentSupabaseRepository } from './establishment-supabase.repository';
import { ServerError } from '../../../../domain/shared/global/errors/global.errors';

describe('EstablishmentSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return establishment when query succeeds', async () => {
    fixtures.whenSupabaseReturnsData();

    const result = await fixtures.whenGetEstablishmentByUserId();

    fixtures.thenQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedEstablishment(result);
  });

  it('should return establishment by id when query succeeds', async () => {
    fixtures.whenSupabaseReturnsData();

    const result = await fixtures.whenGetEstablishmentById();

    fixtures.thenGetByIdQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedEstablishment(result);
  });

  it('should throw ServerError when getEstablishmentByUserId query fails', async () => {
    fixtures.whenSupabaseReturnsError();

    const promise = fixtures.whenGetEstablishmentByUserId();

    await fixtures.thenThrowNotFound(promise);
    fixtures.thenQueryBuiltWithExpectedArguments();
  });

  it('should throw ServerError when getEstablishmentById query fails', async () => {
    fixtures.whenSupabaseReturnsError();

    const promise = fixtures.whenGetEstablishmentById();

    await fixtures.thenThrowNotFound(promise);
    fixtures.thenGetByIdQueryBuiltWithExpectedArguments();
  });

  it('should create establishment when insert succeeds', async () => {
    fixtures.whenCreateSupabaseReturnsData();

    const result = await fixtures.whenCreateEstablishment();

    fixtures.thenCreateQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedCreatedEstablishment(result);
  });

  it('should throw ServerError when createEstablishment insert fails', async () => {
    fixtures.whenCreateSupabaseReturnsError();

    const promise = fixtures.whenCreateEstablishment();

    await fixtures.thenThrowCreationFailed(promise);
    fixtures.thenCreateQueryBuiltWithExpectedArguments();
  });

  it('should return invitation tokens when query succeeds', async () => {
    fixtures.whenInvitationTokensQueryReturnsData();

    const result = await fixtures.whenGetInvitationTokenByEstablishmentId();

    fixtures.thenInvitationTokensQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedInvitationTokens(result);
  });

  it('should throw ServerError when getInvitationTokenByEstablishmentId query fails', async () => {
    fixtures.whenInvitationTokensQueryReturnsError();

    const promise = fixtures.whenGetInvitationTokenByEstablishmentId();

    await fixtures.thenThrowInvitationTokenNotFound(promise);
    fixtures.thenInvitationTokensQueryBuiltWithExpectedArguments();
  });
});

class Fixtures {
  public readonly userId = 'user-1';
  public readonly establishmentSupabaseRow = {
    id: 'est-1',
    name: 'Edesio Academy',
    email: 'owner@edesio.io',
    supabase_user_id: this.userId,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedEstablishment = {
    id: 'est-1',
    name: 'Edesio Academy',
    email: 'owner@edesio.io',
    supabaseUserId: this.userId,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  public readonly createBody = {
    supabaseUserId: 'user-2',
    name: 'Edesio New',
    email: 'new@edesio.io',
  };
  public readonly invitationTokensSupabaseRows = [
    {
      id: 'token-1',
      establishment_id: 'est-1',
      token: 'abc',
      invited_email: 'teacher@school.com',
      expires_at: '2026-04-01T00:00:00.000Z',
      used_at: null,
      used_by: null,
      created_at: '2026-03-28T00:00:00.000Z',
      assigned_chatbots: 2,
    },
  ];
  public readonly expectedInvitationTokens = [
    {
      id: 'token-1',
      establishmentId: 'est-1',
      token: 'abc',
      invitedEmail: 'teacher@school.com',
      expiresAt: '2026-04-01T00:00:00.000Z',
      usedAt: null,
      usedBy: null,
      createdAt: '2026-03-28T00:00:00.000Z',
      assignedChatbots: 2,
    },
  ];
  public readonly createdEstablishmentSupabaseRow = {
    id: 'est-2',
    supabase_user_id: this.createBody.supabaseUserId,
    name: this.createBody.name,
    email: this.createBody.email,
    created_at: '2026-01-02T00:00:00.000Z',
  };

  public readonly expectedCreatedEstablishment = {
    id: 'est-2',
    supabaseUserId: this.createBody.supabaseUserId,
    name: this.createBody.name,
    email: this.createBody.email,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  private readonly singleMock = jest.fn();
  private readonly eqMock = jest.fn(() => ({ single: this.singleMock }));
  private readonly selectMock = jest.fn(() => ({ eq: this.eqMock }));

  private readonly createSingleMock = jest.fn();
  private readonly createSelectMock = jest.fn(() => ({
    single: this.createSingleMock,
  }));
  private readonly insertMock = jest.fn(() => ({
    select: this.createSelectMock,
  }));

  private readonly invitationTokensOrderMock = jest.fn();
  private readonly invitationTokensEqMock = jest.fn(() => ({
    order: this.invitationTokensOrderMock,
  }));
  private readonly invitationTokensSelectMock = jest.fn(() => ({
    eq: this.invitationTokensEqMock,
  }));
  private readonly invitationTokensFromMock = jest.fn(() => ({
    select: this.invitationTokensSelectMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'establishment') {
      return {
        select: this.selectMock,
        insert: this.insertMock,
      };
    }
    if (table === 'invitation_tokens') {
      return this.invitationTokensFromMock();
    }
    return {};
  });

  public readonly repository: EstablishmentSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new EstablishmentSupabaseRepository(supabaseMock as any);
  }

  whenGetEstablishmentByUserId() {
    return this.repository.getEstablishmentByUserId(this.userId);
  }

  whenGetEstablishmentById() {
    return this.repository.getEstablishmentById(
      this.establishmentSupabaseRow.id,
    );
  }

  whenCreateEstablishment() {
    return this.repository.createEstablishment(
      this.createBody.supabaseUserId,
      this.createBody.name,
      this.createBody.email,
    );
  }

  whenGetInvitationTokenByEstablishmentId() {
    return this.repository.getInvitationTokenByEstablishmentId(
      this.establishmentSupabaseRow.id,
    );
  }

  whenSupabaseReturnsData() {
    this.singleMock.mockResolvedValue({
      data: this.establishmentSupabaseRow,
      error: null,
    });
  }

  whenSupabaseReturnsError() {
    this.singleMock.mockResolvedValue({
      data: null,
      error: { message: 'no rows' },
    });
  }

  whenCreateSupabaseReturnsData() {
    this.createSingleMock.mockResolvedValue({
      data: this.createdEstablishmentSupabaseRow,
      error: null,
    });
  }

  whenCreateSupabaseReturnsError() {
    this.createSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'duplicate key value violates unique constraint' },
    });
  }

  whenInvitationTokensQueryReturnsData() {
    this.invitationTokensOrderMock.mockResolvedValue({
      data: this.invitationTokensSupabaseRows,
      error: null,
    });
  }

  whenInvitationTokensQueryReturnsError() {
    this.invitationTokensOrderMock.mockResolvedValue({
      data: null,
      error: { message: 'invitation tokens query failed' },
    });
  }

  async thenThrowNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
  }

  async thenThrowCreationFailed(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
  }

  async thenThrowInvitationTokenNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
  }

  thenQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('establishment');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('supabase_user_id', this.userId);
    expect(this.singleMock).toHaveBeenCalledTimes(1);
  }

  thenGetByIdQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('establishment');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith(
      'id',
      this.establishmentSupabaseRow.id,
    );
    expect(this.singleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedEstablishment(result: any) {
    expect(result).toEqual(this.expectedEstablishment);
  }

  thenCreateQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('establishment');
    expect(this.insertMock).toHaveBeenCalledWith({
      supabase_user_id: this.createBody.supabaseUserId,
      name: this.createBody.name,
      email: this.createBody.email,
    });
    expect(this.createSelectMock).toHaveBeenCalled();
    expect(this.createSingleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedCreatedEstablishment(result: any) {
    expect(result).toEqual(this.expectedCreatedEstablishment);
  }

  thenInvitationTokensQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('invitation_tokens');
    expect(this.invitationTokensSelectMock).toHaveBeenCalledWith('*');
    expect(this.invitationTokensEqMock).toHaveBeenCalledWith(
      'establishment_id',
      this.establishmentSupabaseRow.id,
    );
    expect(this.invitationTokensOrderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(this.invitationTokensOrderMock).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedInvitationTokens(result: any) {
    expect(result).toEqual(this.expectedInvitationTokens);
  }
}
