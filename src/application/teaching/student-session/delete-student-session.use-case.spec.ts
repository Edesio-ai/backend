import { DeleteStudentSessionUseCase } from 'src/application/teaching/student-session/delete-student-session.use-case';
import { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import type { IStudentSessionRepository } from 'src/domain/teaching/student-session/contracts/i-student-session.repository';
import { NotFoundError } from 'src/domain/shared/errors/global.errors';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Student } from 'src/domain/teaching/student/type/student.type';
import { StudentSession } from 'src/domain/teaching/student-session/types/student-session.type';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';

describe('DeleteStudentSessionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should delete the student session when student owns it', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStudentSessionFound();

    await fixtures.whenExecute();

    expect(fixtures.studentSessionRepository.deleteStudentSession).toHaveBeenCalledWith(
      fixtures.sessionId,
      fixtures.student.id,
    );
  });

  it('should throw NotFoundError when student is not found', async () => {
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.studentSessionRepository.getStudentSession).not.toHaveBeenCalled();
    expect(fixtures.studentSessionRepository.deleteStudentSession).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when student session is not found', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStudentSessionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.studentSessionRepository.getStudentSession).toHaveBeenCalledWith(
      fixtures.sessionId,
      fixtures.student.id,
    );
    expect(fixtures.studentSessionRepository.deleteStudentSession).not.toHaveBeenCalled();
  });

  it('should propagate errors from the student repository (getStudentByUserId)', async () => {
    fixtures.whenStudentRepositoryFails();

    await expect(fixtures.whenExecute()).rejects.toThrow('student repo failed');
  });

  it('should propagate errors from the student repository (deleteStudentSession)', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStudentSessionFound();
    fixtures.whenDeleteFails();

    await expect(fixtures.whenExecute()).rejects.toThrow('delete failed');
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly userId = 'user-1';

  public readonly user: AuthUser = {
    id: this.userId,
    email: 'alice@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'student' },
  };

  public readonly student: Student = {
    id: 'student-1',
    supabaseUserId: this.userId,
    name: 'Alice Dupont',
    email: 'alice@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly studentSession: StudentSession = {
    sessionId: this.sessionId,
    studentId: this.student.id,
  };

  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly studentSessionRepository: jest.Mocked<IStudentSessionRepository>;
  public readonly useCase: DeleteStudentSessionUseCase;

  constructor() {
    this.studentRepository = createMockStudentRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.useCase = new DeleteStudentSessionUseCase(this.studentRepository, this.studentSessionRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.sessionId, this.user);
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.student);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenStudentRepositoryFails() {
    this.studentRepository.getStudentByUserId.mockRejectedValue(new Error('student repo failed'));
  }

  whenStudentSessionFound() {
    this.studentSessionRepository.getStudentSession.mockResolvedValue(this.studentSession);
  }

  whenStudentSessionNotFound() {
    this.studentSessionRepository.getStudentSession.mockResolvedValue(null);
  }

  whenDeleteFails() {
    this.studentSessionRepository.deleteStudentSession.mockRejectedValue(new Error('delete failed'));
  }
}
