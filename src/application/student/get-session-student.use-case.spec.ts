import { GetSessionStudentUseCase } from './get-session-student.use-case';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { SessionRepository } from '../../domain/teaching/interface/session.repository';
import {
  ForbiddenError,
  NotFoundError,
} from '../../domain/shared/global/errors/global.errors';
import { SessionStudent } from '../../domain/teaching/types/student.type';

describe('GetSessionStudentUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return the session students when teacher owns the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenStudentsSessionsFound();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.sessionStudents);
  });

  it('should call getStudentsSessionsById with the correct sessionId and select fields', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenStudentsSessionsFound();

    await fixtures.whenExecute();

    expect(
      fixtures.studentRepository.getStudentsSessionsById,
    ).toHaveBeenCalledWith(
      fixtures.sessionId,
      expect.stringContaining('joined_at'),
    );
    expect(
      fixtures.studentRepository.getStudentsSessionsById,
    ).toHaveBeenCalledWith(
      fixtures.sessionId,
      expect.stringContaining('students'),
    );
  });

  it('should throw NotFoundError when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should not call the session or student repository when teacher is not found', async () => {
    fixtures.whenTeacherNotFound();

    await fixtures.whenExecute().catch(() => null);

    expect(fixtures.sessionRepository.getSessionById).not.toHaveBeenCalled();
    expect(
      fixtures.studentRepository.getStudentsSessionsById,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when session is not found', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw ForbiddenError when the teacher does not own the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionOwnedByAnotherTeacher();

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('should return an empty array when the session has no students', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenNoStudentsInSession();

    const result = await fixtures.whenExecute();

    expect(result).toEqual([]);
  });

  it('should propagate repository errors thrown by the student repository', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFound();
    fixtures.whenStudentRepositoryThrows(new Error('DB error'));

    await expect(fixtures.whenExecute()).rejects.toThrow('DB error');
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly userId = 'user-teacher-1';
  public readonly teacherId = 'teacher-1';

  public readonly teacher = {
    id: this.teacherId,
    name: 'Prof Martin',
    email: 'martin@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: 'est-1',
    availableChatbots: 3,
    supabaseUserId: 'supa-teacher-1',
  };

  public readonly session = {
    id: this.sessionId,
    teacherId: this.teacherId,
    name: 'Session de maths',
    code: 'ABC123',
    language: 'francais',
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
  public readonly useCase: GetSessionStudentUseCase;

  constructor() {
    this.studentRepository = {
      createStudentSession: jest.fn(),
      getStudentJoinedSessions: jest.fn(),
      getStudentByUserId: jest.fn(),
      getStudentsSessionsByIds: jest.fn(),
      getStudentsSessionsById: jest.fn(),
      deleteStudentSessionsBySessionId: jest.fn(),
      getStudentStatsByCourseId: jest.fn(),
      deleteStudentCourseStatsByCourseId: jest.fn(),
      createStudent: jest.fn(),
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
    this.useCase = new GetSessionStudentUseCase(
      this.studentRepository,
      this.teacherRepository,
      this.sessionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.sessionId, this.userId);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
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
    this.studentRepository.getStudentsSessionsById.mockResolvedValue(
      this.sessionStudents,
    );
  }

  whenNoStudentsInSession() {
    this.studentRepository.getStudentsSessionsById.mockResolvedValue([]);
  }

  whenStudentRepositoryThrows(error: Error) {
    this.studentRepository.getStudentsSessionsById.mockRejectedValue(error);
  }
}
