import { GetSessionStudentUseCase } from './get-session-student.use-case';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { SessionRepository } from '../../domain/teaching/interface/session.repository';
import { EstablishmentRepository } from '../../domain/teaching/interface/establishment.repository';
import {
  ForbiddenError,
  NotFoundError,
} from '../../domain/shared/global/errors/global.errors';
import { SessionStudent } from '../../domain/teaching/types/student.type';
import { AuthUser } from '../../domain/auth/types/auth.type';

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

  it('should call getStudentSessionsBySessionId with the correct sessionId and select fields', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenStudentsSessionsFound();

    await fixtures.whenExecuteAsTeacher();

    expect(
      fixtures.studentRepository.getStudentSessionsBySessionId,
    ).toHaveBeenCalledWith(
      fixtures.sessionId,
      expect.stringContaining('joined_at'),
    );
    expect(
      fixtures.studentRepository.getStudentSessionsBySessionId,
    ).toHaveBeenCalledWith(
      fixtures.sessionId,
      expect.stringContaining('students'),
    );
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('should not call the session or student repository when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await fixtures.whenExecuteAsTeacher().catch(() => null);

    expect(fixtures.sessionRepository.getSessionById).not.toHaveBeenCalled();
    expect(
      fixtures.studentRepository.getStudentSessionsBySessionId,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when session is not found', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('should throw ForbiddenError when the teacher does not own the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionOwnedByAnotherTeacher();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(
      ForbiddenError,
    );
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

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('should throw NotFoundError when session is not found (establishment role)', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('should throw NotFoundError when teacher does not belong to establishment', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionFound();
    fixtures.whenTeacherNotFoundByConditions();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(
      NotFoundError,
    );
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

  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly sessionRepository: jest.Mocked<SessionRepository>;
  public readonly establishmentRepository: jest.Mocked<EstablishmentRepository>;
  public readonly useCase: GetSessionStudentUseCase;

  constructor() {
    this.studentRepository = {
      getStudentsByIds: jest.fn(),
      createStudentSession: jest.fn(),
      getStudentJoinedSessions: jest.fn(),
      getStudentByUserId: jest.fn(),
      getStudentsSessionsByIds: jest.fn(),
      getStudentSessionsBySessionId: jest.fn(),
      getStudentSessionBySessionId: jest.fn(),
      deleteStudentSessionsBySessionId: jest.fn(),
      getStudentStatsByCourseId: jest.fn(),
      deleteStudentCourseStatsByCourseId: jest.fn(),
      createStudent: jest.fn(),
      storeStudentPhoto: jest.fn(),
      updateStudentPhoto: jest.fn(),
    };
    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
      getTeacherByConditions: jest.fn(),
    };
    this.sessionRepository = {
      getSessionsByTeacherId: jest.fn(),
      getSessionByCode: jest.fn(),
      createSession: jest.fn(),
      updateSessionName: jest.fn(),
      deleteSessionByTeacherId: jest.fn(),
      getSessionById: jest.fn(),
    };
    this.establishmentRepository = {
      getEstablishmentById: jest.fn(),
      getEstablishmentByUserId: jest.fn(),
      createEstablishment: jest.fn(),
      getInvitationTokenByEstablishmentId: jest.fn(),
    };
    this.useCase = new GetSessionStudentUseCase(
      this.studentRepository,
      this.teacherRepository,
      this.sessionRepository,
      this.establishmentRepository,
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
    this.teacherRepository.getTeacherByConditions.mockResolvedValue(
      this.teacher,
    );
  }

  whenTeacherNotFoundByConditions() {
    this.teacherRepository.getTeacherByConditions.mockResolvedValue(null);
  }

  whenEstablishmentFound() {
    this.establishmentRepository.getEstablishmentByUserId.mockResolvedValue(
      this.establishment,
    );
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
    this.studentRepository.getStudentSessionsBySessionId.mockResolvedValue(
      this.sessionStudents,
    );
  }

  whenNoStudentsInSession() {
    this.studentRepository.getStudentSessionsBySessionId.mockResolvedValue([]);
  }

  whenStudentRepositoryThrows(error: Error) {
    this.studentRepository.getStudentSessionsBySessionId.mockRejectedValue(
      error,
    );
  }
}
