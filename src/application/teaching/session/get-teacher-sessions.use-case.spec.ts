import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { GetTeacherSessionsUseCase } from 'src/application/teaching/session/get-teacher-sessions.use-case';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('GetTeacherSessionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return sessions when teacher exists', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionsFound();

    const result = await fixtures.whenExecute();

    fixtures.thenTeacherLookupCalledWithExpectedUserId();
    fixtures.thenSessionsLookupCalledWithTeacherId();
    fixtures.thenReturnExpectedSessions(result);
  });

  it('should throw NotFoundError when teacher does not exist', async () => {
    fixtures.whenTeacherNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    fixtures.thenSessionsLookupNotCalled();
  });

  it('should propagate session repository errors', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionsLookupFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowSessionRepositoryError(promise);
  });
});

class Fixtures {
  public readonly userId = 'user-1';
  public readonly teacher = {
    id: 'teacher-1',
    name: 'Teacher Name',
    email: 'teacher@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null,
    availableChatbots: 2,
    supabaseUserId: this.userId,
  };
  public readonly sessions = [
    {
      id: 'session-1',
      teacherId: this.teacher.id,
      name: 'Cours 1',
      code: 'ABC123',
      language: 'francais' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  public readonly sessionRepositoryError = new Error('sessions query failed');

  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly useCase: GetTeacherSessionsUseCase;

  constructor() {
    this.teacherRepository = createMockTeacherRepository();
    this.sessionRepository = {
      getSessionsByTeacherId: jest.fn(),
      getSessionByCode: jest.fn(),
      createSession: jest.fn(),
      updateSessionName: jest.fn(),
      deleteSessionByTeacherId: jest.fn(),
      getSessionById: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
    };
    this.useCase = new GetTeacherSessionsUseCase(
      this.sessionRepository,
      this.teacherRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.userId);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenSessionsFound() {
    this.sessionRepository.getSessionsByTeacherId.mockResolvedValue(
      this.sessions,
    );
  }

  whenSessionsLookupFails() {
    this.sessionRepository.getSessionsByTeacherId.mockRejectedValue(
      this.sessionRepositoryError,
    );
  }

  async thenThrowTeacherNotFoundError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
  }

  async thenThrowSessionRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.sessionRepositoryError);
  }

  thenTeacherLookupCalledWithExpectedUserId() {
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(
      this.userId,
    );
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledTimes(1);
  }

  thenSessionsLookupCalledWithTeacherId() {
    expect(this.sessionRepository.getSessionsByTeacherId).toHaveBeenCalledWith(
      this.teacher.id,
    );
    expect(this.sessionRepository.getSessionsByTeacherId).toHaveBeenCalledTimes(
      1,
    );
  }

  thenSessionsLookupNotCalled() {
    expect(
      this.sessionRepository.getSessionsByTeacherId,
    ).not.toHaveBeenCalled();
  }

  thenReturnExpectedSessions(result: unknown) {
    expect(result).toEqual(this.sessions);
  }
}
