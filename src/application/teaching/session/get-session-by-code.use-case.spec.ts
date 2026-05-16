import { GetSessionByCodeUseCase } from './get-session-by-code.use-case';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';

describe('GetSessionByCodeUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return session when repository finds one', async () => {
    fixtures.whenSessionFound();

    const result = await fixtures.whenExecute();

    fixtures.thenGetSessionByCodeCalledWithExpectedCode();
    fixtures.thenReturnSession(result);
  });

  it('should return null when repository finds no session', async () => {
    fixtures.whenSessionNotFound();

    const result = await fixtures.whenExecute();

    fixtures.thenGetSessionByCodeCalledWithExpectedCode();
    expect(result).toBeNull();
  });

  it('should propagate repository errors', async () => {
    fixtures.whenRepositoryFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly code = 'ABC123';
  public readonly session = {
    id: 'session-1',
    teacherId: 'teacher-1',
    name: 'Session A',
    code: this.code,
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly repositoryError = new Error('query failed');

  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly useCase: GetSessionByCodeUseCase;

  constructor() {
    this.sessionRepository = createMockSessionRepository();

    this.useCase = new GetSessionByCodeUseCase(this.sessionRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.code);
  }

  whenSessionFound() {
    this.sessionRepository.getSessionByCode.mockResolvedValue(this.session);
  }

  whenSessionNotFound() {
    this.sessionRepository.getSessionByCode.mockResolvedValue(null);
  }

  whenRepositoryFails() {
    this.sessionRepository.getSessionByCode.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenGetSessionByCodeCalledWithExpectedCode() {
    expect(this.sessionRepository.getSessionByCode).toHaveBeenCalledWith(
      this.code,
    );
    expect(this.sessionRepository.getSessionByCode).toHaveBeenCalledTimes(1);
  }

  thenReturnSession(result: unknown) {
    expect(result).toEqual(this.session);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
