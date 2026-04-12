import { GetPendingQuestionCountUseCase } from './get-pending-question-count.use-case';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { QuestionsRepository } from '../../domain/teaching/interface/questions.repository';
import { SupabaseCourse } from '../../domain/teaching/types/course.type';

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
    fixtures.thenQuestionsRepositoryNotCalled();
  });

  it('should propagate errors from questions repository', async () => {
    fixtures.whenSessionHasCourses();
    fixtures.whenPendingCountFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowsQuestionsError(promise);
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
  public readonly questionsError = new Error('pending count failed');

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly questionsRepository: jest.Mocked<QuestionsRepository>;
  public readonly useCase: GetPendingQuestionCountUseCase;

  constructor() {
    this.courseRepository = {
      getCoursesBySessionId: jest.fn(),
      deleteCoursesFilesByCourseIds: jest.fn(),
      deleteCoursesBySessionId: jest.fn(),
      getSessionCoursesCount: jest.fn(),
      createCourse: jest.fn(),
      storeCourseFile: jest.fn(),
      insertCourseFile: jest.fn(),
    };
    this.questionsRepository = {
      deleteQuestionsByCourseIds: jest.fn(),
      getPendingQuestionCount: jest.fn(),
    };

    this.useCase = new GetPendingQuestionCountUseCase(
      this.questionsRepository,
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
    this.questionsRepository.getPendingQuestionCount.mockResolvedValue(n);
  }

  whenPendingCountFails() {
    this.questionsRepository.getPendingQuestionCount.mockRejectedValue(
      this.questionsError,
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
      this.questionsRepository.getPendingQuestionCount,
    ).toHaveBeenCalledWith(ids);
    expect(
      this.questionsRepository.getPendingQuestionCount,
    ).toHaveBeenCalledTimes(1);
  }

  thenQuestionsRepositoryNotCalled() {
    expect(
      this.questionsRepository.getPendingQuestionCount,
    ).not.toHaveBeenCalled();
  }

  async thenThrowsCourseError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.courseError);
  }

  async thenThrowsQuestionsError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.questionsError);
  }
}
