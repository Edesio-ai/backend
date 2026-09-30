import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { UpdateSessionNameInput } from 'src/domain/teaching/session/types/session.type';
import { UpdateSessionNameUseCase } from './update-session-name.use-case';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('UpdateSessionNameUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should update session name with teacher resolved from auth user', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenUpdateSessionNameSucceeds();

    const result = await fixtures.whenExecute();

    fixtures.thenTeacherLookupCalledWithExpectedUserId();
    fixtures.thenUpdateSessionNameCalledWithExpectedArguments();
    fixtures.thenReturnUpdatedSession(result);
  });

  it('should throw NotFoundError when teacher does not exist', async () => {
    fixtures.whenTeacherNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    fixtures.thenUpdateSessionNameNotCalled();
  });

  it('should propagate repository errors', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenUpdateSessionNameFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly userId = 'user-1';
  public readonly sessionId = 'session-1';

  public readonly teacher = {
    id: 'teacher-1',
    name: 'Teacher Name',
    email: 'teacher@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null as string | null,
    availableChatbots: 2,
    supabaseUserId: this.userId,
  };

  public readonly body: UpdateSessionNameInput = {
    name: 'New Session Name',
  };

  public readonly updatedSession = {
    id: this.sessionId,
    teacherId: this.teacher.id,
    name: this.body.name,
    code: 'ABC123',
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
    studentCount: 0,
    pendingQuestionCount: 0,
  };

  public readonly repositoryError = new Error('update failed');

  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly useCase: UpdateSessionNameUseCase;

  constructor() {
    this.teacherRepository = createMockTeacherRepository();
    this.sessionRepository = createMockSessionRepository();
    this.useCase = new UpdateSessionNameUseCase(this.sessionRepository, this.teacherRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.sessionId, this.userId, this.body);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenUpdateSessionNameSucceeds() {
    this.sessionRepository.updateSessionName.mockResolvedValue(this.updatedSession);
  }

  whenUpdateSessionNameFails() {
    this.sessionRepository.updateSessionName.mockRejectedValue(this.repositoryError);
  }

  thenTeacherLookupCalledWithExpectedUserId() {
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(this.userId);
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledTimes(1);
  }

  thenUpdateSessionNameCalledWithExpectedArguments() {
    expect(this.sessionRepository.updateSessionName).toHaveBeenCalledWith(this.sessionId, {
      ...this.body,
      teacherId: this.teacher.id,
    });
    expect(this.sessionRepository.updateSessionName).toHaveBeenCalledTimes(1);
  }

  thenUpdateSessionNameNotCalled() {
    expect(this.sessionRepository.updateSessionName).not.toHaveBeenCalled();
  }

  thenReturnUpdatedSession(result: unknown) {
    expect(result).toEqual(this.updatedSession);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
