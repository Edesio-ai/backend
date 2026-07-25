import { GetSessionStudentUseCase } from './get-session-student.use-case';
import { IStudentRepository } from 'src/domain/teaching/student/contracts/I-student.repository';
import { ITeacherRepository } from 'src/domain/teaching/teacher/contracts/teacher.repository';
import { ISessionRepository } from 'src/domain/teaching/session/contracts/i-session.repository';
import { IEstablishmentRepository } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';
import { ForbiddenError, NotFoundError } from 'src/domain/shared/errors/global.errors';
import { SessionStudent } from 'src/domain/teaching/student-session/types/student-session.type';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockStudentSessionRepository } from 'src/testing/mock-student-session-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockEstablishmentRepository } from 'src/testing/mock-establishment-repository';

describe('GetSessionStudentUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  // ─── teacher role ────────────────────────────────────────────────────────────

  it('should return the session students when teacher owns the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenStudentsSessionsFound();

    const result = await fixtures.whenExecuteAsTeacher();

    expect(result).toEqual(fixtures.sessionStudents);
  });

  it('should call listStudentsEnrolledInSession with the correct sessionId and select fields', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenStudentsSessionsFound();

    await fixtures.whenExecuteAsTeacher();

    expect(fixtures.studentSessionRepository.listStudentsEnrolledInSession).toHaveBeenCalledWith(
      fixtures.sessionId,
      expect.stringContaining('joined_at'),
    );
    expect(fixtures.studentSessionRepository.listStudentsEnrolledInSession).toHaveBeenCalledWith(
      fixtures.sessionId,
      expect.stringContaining('students'),
    );
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should not call the session or student repository when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await fixtures.whenExecuteAsTeacher().catch(() => null);

    expect(fixtures.sessionRepository.getSessionById).not.toHaveBeenCalled();
    expect(fixtures.studentSessionRepository.listStudentsEnrolledInSession).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when session is not found', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw ForbiddenError when the teacher does not own the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionOwnedByAnotherTeacher();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('should return an empty array when the session has no students', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenNoStudentsInSession();

    const result = await fixtures.whenExecuteAsTeacher();

    expect(result).toEqual([]);
  });

  it('should propagate repository errors thrown by the student repository', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenStudentRepositoryThrows(new Error('DB error'));

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toThrow('DB error');
  });

  // ─── establishment role ──────────────────────────────────────────────────────

  it('should return session students when establishment owns the session teacher', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionFound();
    fixtures.whenTeacherFoundByConditions();
    fixtures.whenStudentsSessionsFound();

    const result = await fixtures.whenExecuteAsEstablishment();

    expect(result).toEqual(fixtures.sessionStudents);
  });

  it('should throw NotFoundError when establishment is not found', async () => {
    fixtures.whenEstablishmentNotFound();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw NotFoundError when session is not found (establishment role)', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw NotFoundError when teacher does not belong to establishment', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionFound();
    fixtures.whenTeacherNotFoundByConditions();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(NotFoundError);
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly userId = 'user-teacher-1';
  public readonly teacherId = 'teacher-1';

  public readonly teacherUser: AuthUser = {
    id: this.userId,
    email: 'teacher@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly establishmentUser: AuthUser = {
    id: 'user-est-1',
    email: 'est@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'establishment' },
  };

  public readonly teacher = {
    id: this.teacherId,
    name: 'Prof Martin',
    email: 'martin@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: 'est-1',
    availableChatbots: 3,
    supabaseUserId: 'supa-teacher-1',
  };

  public readonly establishment = {
    id: 'est-1',
    supabaseUserId: 'user-est-1',
    name: 'Edesio Academy',
    email: 'est@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly session = {
    id: this.sessionId,
    teacherId: this.teacherId,
    name: 'Session de maths',
    code: 'ABC123',
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly sessionStudents: SessionStudent[] = [
    {
      id: 'student-1',
      name: 'Alice',
      email: 'alice@school.com',
      photoUrl: 'https://x/a.png',
      joinedAt: '2026-01-15T10:00:00.000Z',
    },
    {
      id: 'student-2',
      name: 'Bob',
      email: 'bob@school.com',
      photoUrl: '',
      joinedAt: '2026-01-16T08:00:00.000Z',
    },
  ];

  public readonly studentRepository: jest.Mocked<IStudentRepository>;
  public readonly teacherRepository: jest.Mocked<ITeacherRepository>;
  public readonly sessionRepository: jest.Mocked<ISessionRepository>;
  public readonly establishmentRepository: jest.Mocked<IEstablishmentRepository>;
  public readonly studentSessionRepository: ReturnType<typeof createMockStudentSessionRepository>;
  public readonly useCase: GetSessionStudentUseCase;

  constructor() {
    this.studentRepository = createMockStudentRepository();
    this.studentSessionRepository = createMockStudentSessionRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.sessionRepository = createMockSessionRepository();
    this.establishmentRepository = createMockEstablishmentRepository();
    this.useCase = new GetSessionStudentUseCase(
      this.studentRepository,
      this.teacherRepository,
      this.sessionRepository,
      this.establishmentRepository,
      this.studentSessionRepository,
    );
  }

  whenExecuteAsTeacher() {
    return this.useCase.execute(this.sessionId, this.teacherUser);
  }

  whenExecuteAsEstablishment() {
    return this.useCase.execute(this.sessionId, this.establishmentUser);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenTeacherFoundByConditions() {
    this.teacherRepository.getTeacherByConditions.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFoundByConditions() {
    this.teacherRepository.getTeacherByConditions.mockResolvedValue(null);
  }

  whenEstablishmentFound() {
    this.establishmentRepository.getEstablishmentByUserId.mockResolvedValue(this.establishment);
  }

  whenEstablishmentNotFound() {
    this.establishmentRepository.getEstablishmentByUserId.mockRejectedValue(
      new NotFoundError('Establishment not found'),
    );
  }

  whenSessionFound() {
    this.sessionRepository.getSessionById.mockResolvedValue(this.session);
  }

  whenSessionNotFound() {
    this.sessionRepository.getSessionById.mockResolvedValue(null);
  }

  whenSessionOwnedByAnotherTeacher() {
    this.sessionRepository.getSessionById.mockResolvedValue({
      ...this.session,
      teacherId: 'another-teacher-99',
    });
  }

  whenStudentsSessionsFound() {
    this.studentSessionRepository.listStudentsEnrolledInSession.mockResolvedValue(this.sessionStudents);
  }

  whenNoStudentsInSession() {
    this.studentSessionRepository.listStudentsEnrolledInSession.mockResolvedValue([]);
  }

  whenStudentRepositoryThrows(error: Error) {
    this.studentSessionRepository.listStudentsEnrolledInSession.mockRejectedValue(error);
  }
}
