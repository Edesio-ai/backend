import { GetSessionCoursesUseCase } from './get-session-courses.use-case';
import { SessionNotFoundError } from '../../domain/auth/errors/auth.errors';
import { AuthUser } from '../../domain/auth/types/auth.type';
import { Establishment } from '../../domain/establishment/establishment.type';
import {
  ForbiddenError,
  NotFoundError,
} from '../../domain/shared/global/errors/global.errors';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { EstablishmentRepository } from '../../domain/teaching/interface/establishment.repository';
import { SessionRepository } from '../../domain/teaching/interface/session.repository';
import { StudentRepository } from '../../domain/teaching/interface/student.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { Course } from '../../domain/teaching/types/course.type';

describe('GetSessionCoursesUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  // --- role teacher ---

  it('should return session courses when teacher owns the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFoundForTeacher();
    fixtures.whenCoursesReturned();

    const result = await fixtures.whenExecuteAsTeacher();

    expect(result).toEqual(fixtures.courses);
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).toHaveBeenCalledWith(fixtures.sessionId);
  });

  it('should throw NotFoundError when teacher is missing', async () => {
    fixtures.whenTeacherNotFound();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(fixtures.sessionRepository.getSessionById).not.toHaveBeenCalled();
  });

  it('should throw SessionNotFoundError when session is missing (teacher path)', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(
      SessionNotFoundError,
    );
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when session belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionBelongsToOtherTeacher();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from course repository (teacher path)', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFoundForTeacher();
    fixtures.whenCoursesFail();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBe(
      fixtures.coursesError,
    );
  });

  // --- role establishment ---

  it('should return session courses when establishment owns the session teacher', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionFoundForTeacher();
    fixtures.whenTeacherFoundByConditions();
    fixtures.whenCoursesReturned();

    const result = await fixtures.whenExecuteAsEstablishment();

    expect(
      fixtures.teachersRepository.getTeacherByConditions,
    ).toHaveBeenCalledWith({
      establishmentId: fixtures.establishment.id,
      id: fixtures.session.teacherId,
    });
    expect(result).toEqual(fixtures.courses);
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).toHaveBeenCalledWith(fixtures.sessionId);
  });

  it('should throw NotFoundError when establishment is missing', async () => {
    fixtures.whenEstablishmentNotFound();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(fixtures.sessionRepository.getSessionById).not.toHaveBeenCalled();
  });

  it('should throw SessionNotFoundError when session is missing (establishment path)', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(
      SessionNotFoundError,
    );
    expect(
      fixtures.teachersRepository.getTeacherByConditions,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when teacher not found for establishment', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionFoundForTeacher();
    fixtures.whenTeacherNotFoundByConditions();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).not.toHaveBeenCalled();
  });

  // --- role student ---

  it('should return session courses when student is enrolled in the session', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStudentEnrolledInSession();
    fixtures.whenCoursesReturned();

    const result = await fixtures.whenExecuteAsStudent();

    expect(result).toEqual(fixtures.courses);
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).toHaveBeenCalledWith(fixtures.sessionId);
  });

  it('should throw NotFoundError when student is not found', async () => {
    fixtures.whenStudentNotFound();

    await expect(fixtures.whenExecuteAsStudent()).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(
      fixtures.studentRepository.getStudentSessionBySessionId,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when student session is not found', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStudentSessionNotFound();

    await expect(fixtures.whenExecuteAsStudent()).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when student is not enrolled in the session', async () => {
    fixtures.whenStudentFound();
    fixtures.whenStudentEnrolledInOtherSession();

    await expect(fixtures.whenExecuteAsStudent()).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).not.toHaveBeenCalled();
  });

  // --- unknown role ---

  it('should throw ForbiddenError for unknown role', async () => {
    await expect(fixtures.whenExecuteWithUnknownRole()).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).not.toHaveBeenCalled();
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';

  public readonly teacherUser: AuthUser = {
    id: 'user-1',
    email: 't@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly establishmentUser: AuthUser = {
    id: 'user-2',
    email: 'est@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'establishment' },
  };

  public readonly studentUser: AuthUser = {
    id: 'user-3',
    email: 'student@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'student' },
  };

  public readonly teacher = {
    id: 'teacher-1',
    name: 'Prof',
    email: 't@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: 'est-1' as string | null,
    availableChatbots: 0,
    supabaseUserId: 'user-1',
  };

  public readonly student = {
    id: 'student-1',
    supabaseUserId: 'user-3',
    name: 'Alice',
    email: 'student@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: '',
  };

  public readonly studentSession = {
    sessionId: this.sessionId,
    studentId: 'student-1',
  };

  public readonly establishment: Establishment = {
    id: 'est-1',
    supabaseUserId: 'user-2',
    name: 'École Nationale',
    email: 'est@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly session = {
    id: this.sessionId,
    teacherId: this.teacher.id,
    name: 'Séance',
    code: 'ABCD',
    language: 'francais' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly courses: Course[] = [
    {
      id: 'c-1',
      sessionId: this.sessionId,
      title: 'Cours 1',
      description: null,
      contentText: null,
    },
  ];

  public readonly coursesError = new Error('courses failed');

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly teachersRepository: jest.Mocked<TeacherRepository>;
  public readonly sessionRepository: jest.Mocked<SessionRepository>;
  public readonly establishmentRepository: jest.Mocked<EstablishmentRepository>;
  public readonly studentRepository: jest.Mocked<StudentRepository>;
  public readonly useCase: GetSessionCoursesUseCase;

  constructor() {
    this.courseRepository = {
      getCourseById: jest.fn(),
      getCourseWithSessionById: jest.fn(),
      getSessionCoursesBySessionId: jest.fn(),
      getCoursesBySessionId: jest.fn(),
      deleteCoursesFilesByCourseIds: jest.fn(),
      deleteCoursesBySessionId: jest.fn(),
      getSessionCoursesCount: jest.fn(),
      createCourse: jest.fn(),
      storeCourseFile: jest.fn(),
      insertCourseFile: jest.fn(),
      getCourseValidatedQuestions: jest.fn(),
      getCourseFilesByCourseId: jest.fn(),
      getFileBufferFromStorage: jest.fn(),
      deleteCourseById: jest.fn(),
      updateCourse: jest.fn(),
    };
    this.teachersRepository = {
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
    this.studentRepository = {
      getStudentsByIds: jest.fn(),
      createStudentSession: jest.fn(),
      getStudentJoinedSessions: jest.fn(),
      getStudentByUserId: jest.fn(),
      getStudentsSessionsByIds: jest.fn(),
      getStudentSessionsBySessionId: jest.fn(),
      deleteStudentSessionsBySessionId: jest.fn(),
      deleteStudentSession: jest.fn(),
      getStudentStatsByCourseId: jest.fn(),
      deleteStudentCourseStatsByCourseId: jest.fn(),
      createStudent: jest.fn(),
      storeStudentPhoto: jest.fn(),
      updateStudentPhoto: jest.fn(),
      getStudentSessionBySessionId: jest.fn(),
    };
    this.useCase = new GetSessionCoursesUseCase(
      this.courseRepository,
      this.teachersRepository,
      this.sessionRepository,
      this.establishmentRepository,
      this.studentRepository,
    );
  }

  whenExecuteAsTeacher() {
    return this.useCase.execute(this.sessionId, this.teacherUser);
  }

  whenExecuteAsEstablishment() {
    return this.useCase.execute(this.sessionId, this.establishmentUser);
  }

  whenExecuteAsStudent() {
    return this.useCase.execute(this.sessionId, this.studentUser);
  }

  whenExecuteWithUnknownRole() {
    const unknownUser: AuthUser = {
      ...this.teacherUser,
      metadata: { role: 'unknown' as any },
    };
    return this.useCase.execute(this.sessionId, unknownUser);
  }

  whenTeacherFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenEstablishmentFound() {
    this.establishmentRepository.getEstablishmentByUserId.mockResolvedValue(
      this.establishment,
    );
  }

  whenEstablishmentNotFound() {
    this.establishmentRepository.getEstablishmentByUserId.mockResolvedValue(
      null as any,
    );
  }

  whenTeacherFoundByConditions() {
    this.teachersRepository.getTeacherByConditions.mockResolvedValue(
      this.teacher,
    );
  }

  whenTeacherNotFoundByConditions() {
    this.teachersRepository.getTeacherByConditions.mockResolvedValue(null);
  }

  whenSessionFoundForTeacher() {
    this.sessionRepository.getSessionById.mockResolvedValue(this.session);
  }

  whenSessionNotFound() {
    this.sessionRepository.getSessionById.mockResolvedValue(null);
  }

  whenSessionBelongsToOtherTeacher() {
    this.sessionRepository.getSessionById.mockResolvedValue({
      ...this.session,
      teacherId: 'other-teacher',
    });
  }

  whenCoursesReturned() {
    this.courseRepository.getSessionCoursesBySessionId.mockResolvedValue(
      this.courses,
    );
  }

  whenCoursesFail() {
    this.courseRepository.getSessionCoursesBySessionId.mockRejectedValue(
      this.coursesError,
    );
  }

  whenStudentFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(this.student);
  }

  whenStudentNotFound() {
    this.studentRepository.getStudentByUserId.mockResolvedValue(null);
  }

  whenStudentEnrolledInSession() {
    this.studentRepository.getStudentSessionBySessionId.mockResolvedValue(
      this.studentSession,
    );
  }

  whenStudentSessionNotFound() {
    this.studentRepository.getStudentSessionBySessionId.mockResolvedValue(null);
  }

  whenStudentEnrolledInOtherSession() {
    this.studentRepository.getStudentSessionBySessionId.mockResolvedValue({
      sessionId: this.sessionId,
      studentId: 'other-student-99',
    });
  }
}
