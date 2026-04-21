import { GetSessionCoursesUseCase } from './get-session-courses.use-case';
import { SessionNotFoundError } from '../../domain/auth/errors/auth.errors';
import { AuthUser } from '../../domain/auth/types/auth.type';
import { ForbiddenError } from '../../domain/shared/global/errors/global.errors';
import { TeacherNotFoundError } from '../../domain/teaching/error';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { SessionRepository } from '../../domain/teaching/interface/session.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';
import { Course } from '../../domain/teaching/types/course.type';

describe('GetSessionCoursesUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return session courses when teacher owns the session', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFoundForTeacher();
    fixtures.whenCoursesReturned();

    const result = await fixtures.whenExecute();

    expect(result).toEqual(fixtures.courses);
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).toHaveBeenCalledWith(fixtures.sessionId);
  });

  it('should throw TeacherNotFoundError when teacher is missing', async () => {
    fixtures.whenTeacherNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(TeacherNotFoundError);
    expect(fixtures.sessionRepository.getSessionById).not.toHaveBeenCalled();
  });

  it('should throw SessionNotFoundError when session is missing', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(SessionNotFoundError);
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when session belongs to another teacher', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionBelongsToOtherTeacher();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.courseRepository.getSessionCoursesBySessionId,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from course repository', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenSessionFoundForTeacher();
    fixtures.whenCoursesFail();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBe(fixtures.coursesError);
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly user: AuthUser = {
    id: 'user-1',
    email: 't@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly teacher = {
    id: 'teacher-1',
    name: 'Prof',
    email: 't@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    establishmentId: null as string | null,
    availableChatbots: 0,
    supabaseUserId: this.user.id,
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
    };
    this.teachersRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
    };
    this.sessionRepository = {
      getSessionsByTeacherId: jest.fn(),
      getSessionByCode: jest.fn(),
      createSession: jest.fn(),
      updateSessionName: jest.fn(),
      deleteSessionByTeacherId: jest.fn(),
      getSessionById: jest.fn(),
    };

    this.useCase = new GetSessionCoursesUseCase(
      this.courseRepository,
      this.teachersRepository,
      this.sessionRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.sessionId, this.user);
  }

  whenTeacherFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenTeacherNotFound() {
    this.teachersRepository.getTeacherByUserId.mockResolvedValue(null as any);
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
}
