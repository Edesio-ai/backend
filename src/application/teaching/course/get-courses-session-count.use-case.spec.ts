import { GetCoursesSessionCountUseCase } from './get-courses-session-count.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import { Course } from 'src/domain/teaching/course/types/course.type';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';

describe('GetCoursesSessionCountUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return session courses count from repository for a teacher', async () => {
    fixtures.whenCountReturns(4);

    const result = await fixtures.whenExecuteAsTeacher();

    expect(result).toBe(4);
    fixtures.thenRepositoryCalledWithSessionId();
  });

  it('should count only student-visible courses for a student', async () => {
    fixtures.whenSessionCoursesReturned();

    const result = await fixtures.whenExecuteAsStudent();

    expect(result).toBe(2);
    expect(fixtures.courseRepository.getSessionCoursesBySessionId).toHaveBeenCalledWith(fixtures.sessionId);
    expect(fixtures.courseRepository.getSessionCoursesCount).not.toHaveBeenCalled();
  });

  it('should propagate repository errors', async () => {
    fixtures.whenCountFails();

    const promise = fixtures.whenExecuteAsTeacher();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly repositoryError = new Error('count query failed');

  public readonly teacherUser: AuthUser = {
    id: 'user-teacher',
    email: 't@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'teacher' },
  };

  public readonly studentUser: AuthUser = {
    id: 'user-student',
    email: 's@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'student' },
  };

  public readonly sessionCourses: Course[] = [
    {
      id: 'c-published',
      sessionId: this.sessionId,
      title: 'Publié',
      description: null,
      validatedQuestions: true,
    },
    {
      id: 'c-draft',
      sessionId: this.sessionId,
      title: 'Brouillon',
      description: null,
      validatedQuestions: false,
    },
    {
      id: 'c-legacy',
      sessionId: this.sessionId,
      title: 'Legacy',
      description: null,
    },
  ];

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly useCase: GetCoursesSessionCountUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.useCase = new GetCoursesSessionCountUseCase(this.courseRepository);
  }

  whenExecuteAsTeacher() {
    return this.useCase.execute(this.sessionId, this.teacherUser);
  }

  whenExecuteAsStudent() {
    return this.useCase.execute(this.sessionId, this.studentUser);
  }

  whenCountReturns(n: number) {
    this.courseRepository.getSessionCoursesCount.mockResolvedValue(n);
  }

  whenSessionCoursesReturned() {
    this.courseRepository.getSessionCoursesBySessionId.mockResolvedValue(this.sessionCourses);
  }

  whenCountFails() {
    this.courseRepository.getSessionCoursesCount.mockRejectedValue(this.repositoryError);
  }

  thenRepositoryCalledWithSessionId() {
    expect(this.courseRepository.getSessionCoursesCount).toHaveBeenCalledWith(this.sessionId);
    expect(this.courseRepository.getSessionCoursesCount).toHaveBeenCalledTimes(1);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
