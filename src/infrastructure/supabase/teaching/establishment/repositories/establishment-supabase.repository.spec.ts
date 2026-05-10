import { EstablishmentSupabaseRepository } from './establishment-supabase.repository';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';

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

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'establishment') {
      return {
        select: this.selectMock,
        insert: this.insertMock,
      };
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

  async thenThrowNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
  }

  async thenThrowCreationFailed(promise: Promise<unknown>) {
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
}
