import { CreateEstablishmentUseCase } from './create-establishment.use-case';
import { EstablishmentRepository } from '../../interfaces/persistence/establishment.repository';
import {
  CreateEstablishmentBody,
  Establishment,
} from '../../domain/establishment/establishment.type';

describe('CreateEstablishmentUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create establishment with repository and return it', async () => {
    fixtures.whenRepositoryReturnsEstablishment();

    const result = await fixtures.whenExecuteWith(fixtures.body);

    fixtures.thenRepositoryCalledWithExpectedArguments();
    fixtures.thenReturnExpectedEstablishment(result);
  });

  it('should propagate repository error', async () => {
    fixtures.whenRepositoryThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.body);

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenRepositoryCalledWithExpectedArguments();
  });
});

class Fixtures {
  public readonly establishmentRepository: jest.Mocked<EstablishmentRepository>;
  public readonly createEstablishmentUseCase: CreateEstablishmentUseCase;

  public readonly body: CreateEstablishmentBody;
  public readonly establishment: Establishment;
  public readonly repositoryError: Error;

  constructor() {
    this.establishmentRepository = {
      getEstablishmentByUserId: jest.fn(),
      createEstablishment: jest.fn(),
    };

    this.createEstablishmentUseCase = new CreateEstablishmentUseCase(
      this.establishmentRepository,
    );

    this.body = {
      supabaseUserId: 'user-1',
      name: 'Edesio Academy',
      email: 'contact@edesio.io',
    };

    this.establishment = {
      id: 'est-1',
      supabaseUserId: this.body.supabaseUserId,
      name: this.body.name,
      email: this.body.email,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    this.repositoryError = new Error('insert failed');
  }

  whenExecuteWith(body: CreateEstablishmentBody) {
    return this.createEstablishmentUseCase.execute(body);
  }

  whenRepositoryReturnsEstablishment() {
    this.establishmentRepository.createEstablishment.mockResolvedValue(
      this.establishment,
    );
  }

  whenRepositoryThrowsError() {
    this.establishmentRepository.createEstablishment.mockRejectedValue(
      this.repositoryError,
    );
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenRepositoryCalledWithExpectedArguments() {
    expect(
      this.establishmentRepository.createEstablishment,
    ).toHaveBeenCalledWith(
      this.body.supabaseUserId,
      this.body.name,
      this.body.email,
    );
    expect(
      this.establishmentRepository.createEstablishment,
    ).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedEstablishment(result: Establishment) {
    expect(result).toEqual(this.establishment);
  }
}
