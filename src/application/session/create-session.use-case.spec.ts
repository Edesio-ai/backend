import { CreateSessionUseCase } from './create-session.use-case';
import { SessionRepository } from '../../domain/teaching/interface/session.repository';
import { CreateSessionBody } from '../../domain/teaching/types/session.type';

describe('CreateSessionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create session with expected payload', async () => {
    fixtures.whenCreateSessionSucceeds();

    const result = await fixtures.whenExecute();

    fixtures.thenCreateSessionCalledWithExpectedPayload();
    fixtures.thenReturnCreatedSession(result);
  });

  it('should propagate repository errors', async () => {
    fixtures.whenCreateSessionFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly body: CreateSessionBody = {
    name: 'Session A',
    code: 'ABC123',
    language: 'francais',
    teacherId: 'teacher-1',
  };

  public readonly createdSession = {
    id: 'session-1',
    teacher_id: this.body.teacherId,
    name: this.body.name,
    code: this.body.code,
    language: this.body.language,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly repositoryError = new Error('insert failed');

  public readonly sessionRepository: jest.Mocked<SessionRepository>;
  public readonly useCase: CreateSessionUseCase;

  constructor() {
    this.sessionRepository = {
      getSessionsByTeacherId: jest.fn(),
      getSessionByCode: jest.fn(),
      createSession: jest.fn(),
      updateSessionName: jest.fn(),
    };
    this.useCase = new CreateSessionUseCase(this.sessionRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.body);
  }

  whenCreateSessionSucceeds() {
    this.sessionRepository.createSession.mockResolvedValue(
      this.createdSession as any,
    );
  }

  whenCreateSessionFails() {
    this.sessionRepository.createSession.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenCreateSessionCalledWithExpectedPayload() {
    expect(this.sessionRepository.createSession).toHaveBeenCalledWith(
      this.body,
    );
    expect(this.sessionRepository.createSession).toHaveBeenCalledTimes(1);
  }

  thenReturnCreatedSession(result: unknown) {
    expect(result).toEqual(this.createdSession);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
