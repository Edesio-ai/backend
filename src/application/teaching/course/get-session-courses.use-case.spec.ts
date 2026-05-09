import { GetSessionCoursesUseCase } from 'src/application/teaching/course/get-session-courses.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Establishment } from 'src/domain/teaching/types/establishment.type';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/global/errors/global.errors';
import { CourseRepository } from 'src/domain/teaching/interfaces/course.repository';
import { EstablishmentRepository } from 'src/domain/teaching/interfaces/establishment.repository';
import { SessionRepository } from 'src/domain/teaching/interfaces/session.repository';
import { StudentRepository } from 'src/domain/teaching/interfaces/student.repository';
import { TeacherRepository } from 'src/domain/teaching/interfaces/teacher.repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockEstablishmentRepository } from 'src/testing/mock-establishment-repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockStudentRepository } from 'src/testing/mock-student-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';
import { Course } from 'src/domain/teaching/types/course.type';

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

  it('should throw NotFoundError when session is missing (teacher path)', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecuteAsTeacher()).rejects.toBeInstanceOf(
      NotFoundError,
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

  it('should throw NotFoundError when session is missing (establishment path)', async () => {
    fixtures.whenEstablishmentFound();
    fixtures.whenSessionNotFound();

    await expect(fixtures.whenExecuteAsEstablishment()).rejects.toBeInstanceOf(
      NotFoundError,
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
    this.courseRepository = createMockCourseRepository();
    this.teachersRepository = createMockTeacherRepository();
    this.sessionRepository = createMockSessionRepository();
    this.establishmentRepository = createMockEstablishmentRepository();
    this.studentRepository = createMockStudentRepository();
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
