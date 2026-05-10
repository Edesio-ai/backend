import { ISessionRepository } from 'src/domain/teaching/interface/session.repository';
import { UpdateSessionNameUseCase } from './update-session-name.use-case';

describe('UpdateSessionNameUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should update session name with expected arguments', async () => {
    fixtures.whenUpdateSessionNameSucceeds();

    const result = await fixtures.whenExecute();

    fixtures.thenUpdateSessionNameCalledWithExpectedArguments();
    fixtures.thenReturnUpdatedSession(result);
  });

  it('should propagate repository errors', async () => {
    fixtures.whenUpdateSessionNameFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly body = {
    name: 'New Session Name',
    teacherId: 'teacher-1',
  };
  public readonly updatedSession = {
    id: this.sessionId,
    teacherId: this.body.teacherId,
    name: this.body.name,
    code: 'ABC123',
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  public readonly repositoryError = new Error('update failed');

  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly useCase: UpdateSessionNameUseCase;

  constructor() {
    this.sessionRepository = {
      getSessionsByTeacherId: jest.fn(),
      getSessionByCode: jest.fn(),
      createSession: jest.fn(),
      updateSessionName: jest.fn(),
      deleteSessionByTeacherId: jest.fn(),
      getSessionById: jest.fn(),
    };
    this.useCase = new UpdateSessionNameUseCase(this.sessionRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.sessionId, this.body);
  }

  whenUpdateSessionNameSucceeds() {
    this.sessionRepository.updateSessionName.mockResolvedValue(
      this.updatedSession,
    );
  }

  whenUpdateSessionNameFails() {
    this.sessionRepository.updateSessionName.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenUpdateSessionNameCalledWithExpectedArguments() {
    expect(this.sessionRepository.updateSessionName).toHaveBeenCalledWith(
      this.sessionId,
      this.body,
    );
    expect(this.sessionRepository.updateSessionName).toHaveBeenCalledTimes(1);
  }

  thenReturnUpdatedSession(result: unknown) {
    expect(result).toEqual(this.updatedSession);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
