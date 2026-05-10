import { GetPendingQuestionCountUseCase } from 'src/application/teaching/course-question/get-pending-question-count.use-case';
import { ICourseRepository } from 'src/domain/teaching/interfaces/course.repository';
import type { ICourseQuestionRepository } from 'src/domain/teaching/interfaces/i-course-question.repository';
import { SupabaseCourse } from 'src/domain/teaching/types/course.type';
import { createMockCourseQuestionRepository } from 'src/testing/mock-course-question-repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';

describe('GetPendingQuestionCountUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return pending count for course ids of the session', async () => {
    fixtures.whenSessionHasCourses();
    fixtures.whenPendingCountReturns(7);

    const result = await fixtures.whenExecute();

    expect(result).toBe(7);
    fixtures.thenCoursesLoadedForSession();
    fixtures.thenPendingCountCalledWithCourseIds(['course-1', 'course-2']);
  });

  it('should return 0 when session has no courses', async () => {
    fixtures.whenSessionHasNoCourses();
    fixtures.whenPendingCountReturns(0);

    const result = await fixtures.whenExecute();

    expect(result).toBe(0);
    fixtures.thenCoursesLoadedForSession();
    fixtures.thenPendingCountCalledWithCourseIds([]);
  });

  it('should propagate errors from course repository', async () => {
    fixtures.whenCoursesQueryFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowsCourseError(promise);
    fixtures.thenCourseQuestionRepositoryNotCalled();
  });

  it('should propagate errors from course question repository', async () => {
    fixtures.whenSessionHasCourses();
    fixtures.whenPendingCountFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowsCourseQuestionsError(promise);
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly courses: SupabaseCourse[] = [
    {
      id: 'course-1',
      session_id: this.sessionId,
      title: 'Cours A',
      description: null,
      text_content: null,
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'course-2',
      session_id: this.sessionId,
      title: 'Cours B',
      description: null,
      text_content: null,
      created_at: '2026-01-02T00:00:00.000Z',
    },
  ];

  public readonly courseError = new Error('courses query failed');
  public readonly courseQuestionsError = new Error('pending count failed');

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly courseQuestionRepository: jest.Mocked<ICourseQuestionRepository>;
  public readonly useCase: GetPendingQuestionCountUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.courseQuestionRepository = createMockCourseQuestionRepository();

    this.useCase = new GetPendingQuestionCountUseCase(
      this.courseQuestionRepository,
      this.courseRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.sessionId);
  }

  whenSessionHasCourses() {
    this.courseRepository.getCoursesBySessionId.mockResolvedValue(this.courses);
  }

  whenSessionHasNoCourses() {
    this.courseRepository.getCoursesBySessionId.mockResolvedValue([]);
  }

  whenCoursesQueryFails() {
    this.courseRepository.getCoursesBySessionId.mockRejectedValue(
      this.courseError,
    );
  }

  whenPendingCountReturns(n: number) {
    this.courseQuestionRepository.getPendingQuestionCount.mockResolvedValue(n);
  }

  whenPendingCountFails() {
    this.courseQuestionRepository.getPendingQuestionCount.mockRejectedValue(
      this.courseQuestionsError,
    );
  }

  thenCoursesLoadedForSession() {
    expect(this.courseRepository.getCoursesBySessionId).toHaveBeenCalledWith(
      this.sessionId,
    );
    expect(this.courseRepository.getCoursesBySessionId).toHaveBeenCalledTimes(
      1,
    );
  }

  thenPendingCountCalledWithCourseIds(ids: string[]) {
    expect(
      this.courseQuestionRepository.getPendingQuestionCount,
    ).toHaveBeenCalledWith(ids);
    expect(
      this.courseQuestionRepository.getPendingQuestionCount,
    ).toHaveBeenCalledTimes(1);
  }

  thenCourseQuestionRepositoryNotCalled() {
    expect(
      this.courseQuestionRepository.getPendingQuestionCount,
    ).not.toHaveBeenCalled();
  }

  async thenThrowsCourseError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.courseError);
  }

  async thenThrowsCourseQuestionsError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.courseQuestionsError);
  }
}
