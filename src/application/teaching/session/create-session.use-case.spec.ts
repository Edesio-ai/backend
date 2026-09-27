import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import { CreateSessionUseCase } from './create-session.use-case';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { CreateSessionInput } from 'src/domain/teaching/session/types/session.type';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('CreateSessionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create session with teacher resolved from auth user', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCreateSessionSucceeds();

    const result = await fixtures.whenExecute();

    fixtures.thenTeacherLookupCalledWithExpectedUserId();
    fixtures.thenCreateSessionCalledWithExpectedPayload();
    fixtures.thenReturnCreatedSession(result);
  });

  it('should throw NotFoundError when teacher does not exist', async () => {
    fixtures.whenTeacherNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    fixtures.thenCreateSessionNotCalled();
  });

  it('should propagate repository errors', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenCreateSessionFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly userId = 'user-1';

  public readonly teacher = {
    id: 'teacher-1',
    name: 'Teacher Name',
    email: 'teacher@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null as string | null,
    availableChatbots: 2,
    supabaseUserId: this.userId,
  };

  public readonly body: CreateSessionInput = {
    name: 'Session A',
    code: 'ABC123',
    language: 'francais' as const,
  };

  public readonly createdSession = {
    id: 'session-1',
    teacherId: this.teacher.id,
    name: this.body.name,
    code: this.body.code,
    language: this.body.language,
    createdAt: '2026-01-01T00:00:00.000Z',
    studentCount: 0,
    pendingQuestionCount: 0,
  };

  public readonly repositoryError = new Error('insert failed');

  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly useCase: CreateSessionUseCase;

  constructor() {
    this.teacherRepository = createMockTeacherRepository();
    this.sessionRepository = createMockSessionRepository();
    this.useCase = new CreateSessionUseCase(this.sessionRepository, this.teacherRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.body);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenCreateSessionSucceeds() {
    this.sessionRepository.createSession.mockResolvedValue(this.createdSession);
  }

  whenCreateSessionFails() {
    this.sessionRepository.createSession.mockRejectedValue(this.repositoryError);
  }

  thenTeacherLookupCalledWithExpectedUserId() {
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(this.userId);
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledTimes(1);
  }

  thenCreateSessionCalledWithExpectedPayload() {
    expect(this.sessionRepository.createSession).toHaveBeenCalledWith({
      ...this.body,
      teacherId: this.teacher.id,
    });
    expect(this.sessionRepository.createSession).toHaveBeenCalledTimes(1);
  }

  thenCreateSessionNotCalled() {
    expect(this.sessionRepository.createSession).not.toHaveBeenCalled();
  }

  thenReturnCreatedSession(result: unknown) {
    expect(result).toEqual(this.createdSession);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
