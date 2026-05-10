import { ForbiddenException } from '@nestjs/common';
import { GetCourseRankingUseCase } from 'src/application/teaching/student-course-stats/get-course-ranking.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { CourseRepository } from 'src/domain/teaching/interfaces/course.repository';
import { SessionRepository } from 'src/domain/teaching/interfaces/session.repository';
import type { IStudentCourseStatsRepository } from 'src/domain/teaching/interfaces/i-student-course-stats.repository';
import { TeacherRepository } from 'src/domain/teaching/interfaces/teacher.repository';
import { Course } from 'src/domain/teaching/types/course.type';
import { Session } from 'src/domain/teaching/types/session.type';
import { StudentCourseStatsWithStudent } from 'src/domain/teaching/types/student.type';
import { NotFoundError } from 'src/domain/shared/global/errors/global.errors';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';
import { createMockSessionRepository } from 'src/testing/mock-session-repository';
import { createMockStudentCourseStatsRepository } from 'src/testing/mock-student-course-stats-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';

describe('GetCourseRankingUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw NotFoundError when course is missing', async () => {
    fixtures.whenCourseNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw NotFoundError when teacher is missing', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should throw ForbiddenException when session teacher does not match', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionOwnedByAnotherTeacher();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(ForbiddenException);
    expect(
      fixtures.studentCourseStatsRepository.getStudentStatsByCourseId,
    ).not.toHaveBeenCalled();
  });

  it('should return ranking sorted by success rate then correct answers with ranks', async () => {
    fixtures.whenCourseFound();
    fixtures.whenTeacherFound();
    fixtures.whenSessionMatchesTeacher();
    fixtures.whenStudentStatsReturnUnsorted();

    const result = await fixtures.whenExecute();

    expect(result).toHaveLength(4);
    expect(result[0].studentId).toBe('s-perfect');
    expect(result[0].rank).toBe(1);
    expect(result[0].successRate).toBe(100);
    expect(result[1].studentId).toBe('s-tie-b');
    expect(result[1].rank).toBe(2);
    expect(result[1].successRate).toBe(90);
    expect(result[2].studentId).toBe('s-tie-a');
    expect(result[2].rank).toBe(3);
    expect(result[2].successRate).toBe(80);
    expect(result[3].studentId).toBe('s-low');
    expect(result[3].rank).toBe(4);
    expect(result[3].successRate).toBe(50);
    expect(
      fixtures.studentCourseStatsRepository.getStudentStatsByCourseId,
    ).toHaveBeenCalledWith(fixtures.course.id);
  });
});

class Fixtures {
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

  public readonly course: Course = {
    id: 'course-1',
    sessionId: 'session-1',
    title: 'Cours',
    description: null,
    contentText: null,
  };

  public readonly session: Session = {
    id: this.course.sessionId,
    teacherId: this.teacher.id,
    name: 'Séance',
    code: 'ABCD',
    language: 'francais',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  /** Order volontairement mélangé : le use case trie par taux puis bonnes réponses. */
  public readonly studentStatsUnsorted: StudentCourseStatsWithStudent[] = [
    {
      studentId: 's-low',
      attemptedQuestions: 10,
      correctAnswers: 5,
      lastAttemptAt: '2026-01-03T00:00:00.000Z',
      student: {
        id: 's-low',
        email: 'low@school.com',
        name: 'Low',
        photoUrl: '',
      },
    },
    {
      studentId: 's-perfect',
      attemptedQuestions: 4,
      correctAnswers: 4,
      lastAttemptAt: '2026-01-01T00:00:00.000Z',
      student: {
        id: 's-perfect',
        email: 'perfect@school.com',
        name: 'Perfect',
        photoUrl: '',
      },
    },
    {
      studentId: 's-tie-a',
      attemptedQuestions: 10,
      correctAnswers: 8,
      lastAttemptAt: '2026-01-02T00:00:00.000Z',
      student: {
        id: 's-tie-a',
        email: 'tiea@school.com',
        name: 'TieA',
        photoUrl: '',
      },
    },
    {
      studentId: 's-tie-b',
      attemptedQuestions: 10,
      correctAnswers: 9,
      lastAttemptAt: '2026-01-02T12:00:00.000Z',
      student: {
        id: 's-tie-b',
        email: 'tieb@school.com',
        name: 'TieB',
        photoUrl: '',
      },
    },
  ];

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly sessionRepository: jest.Mocked<SessionRepository>;
  public readonly studentCourseStatsRepository: jest.Mocked<IStudentCourseStatsRepository>;
  public readonly useCase: GetCourseRankingUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.teacherRepository = createMockTeacherRepository();
    this.sessionRepository = createMockSessionRepository();
    this.studentCourseStatsRepository =
      createMockStudentCourseStatsRepository();

    this.useCase = new GetCourseRankingUseCase(
      this.courseRepository,
      this.teacherRepository,
      this.sessionRepository,
      this.studentCourseStatsRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.course.id, this.user);
  }

  whenCourseNotFound() {
    this.courseRepository.getCourseById.mockResolvedValue(null as any);
  }

  whenCourseFound() {
    this.courseRepository.getCourseById.mockResolvedValue(this.course);
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenTeacherFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(this.teacher);
  }

  whenSessionMatchesTeacher() {
    this.sessionRepository.getSessionById.mockResolvedValue(this.session);
  }

  whenSessionOwnedByAnotherTeacher() {
    this.sessionRepository.getSessionById.mockResolvedValue({
      ...this.session,
      teacherId: 'other-teacher',
    });
  }

  whenStudentStatsReturnUnsorted() {
    this.studentCourseStatsRepository.getStudentStatsByCourseId.mockResolvedValue(
      this.studentStatsUnsorted,
    );
  }
}
