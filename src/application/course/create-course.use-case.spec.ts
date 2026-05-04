import { CreateCourseUseCase } from './create-course.use-case';
import { CourseRepository } from '../../domain/teaching/interface/course.repository';
import { CreateCourseBody } from '../../domain/teaching/types/course.type';

describe('CreateCourseUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should create course with expected payload', async () => {
    fixtures.whenCreateCourseSucceeds();

    const result = await fixtures.whenExecute();

    fixtures.thenCreateCourseCalledWithExpectedPayload();
    fixtures.thenReturnCreatedCourse(result);
  });

  it('should propagate repository errors', async () => {
    fixtures.whenCreateCourseFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly body: CreateCourseBody = {
    sessionId: 'session-1',
    title: 'Intro',
    description: 'Desc',
    contentText: 'Body',
  };

  public readonly createdCourse = {
    id: 'course-1',
    session_id: this.body.sessionId,
    title: this.body.title,
    description: this.body.description,
    text_content: this.body.contentText,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly repositoryError = new Error('insert failed');

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: CreateCourseUseCase;

  constructor() {
    this.courseRepository = {
      getCoursesBySessionId: jest.fn(),
      deleteCoursesFilesByCourseIds: jest.fn(),
      deleteCoursesBySessionId: jest.fn(),
      getSessionCoursesCount: jest.fn(),
      createCourse: jest.fn(),
      storeCourseFile: jest.fn(),
      insertCourseFile: jest.fn(),
      getCourseById: jest.fn(),
      getCourseWithSessionById: jest.fn(),
      getSessionCoursesBySessionId: jest.fn(),
      getCourseValidatedQuestions: jest.fn(),
      getCourseFilesByCourseId: jest.fn(),
      getFileBufferFromStorage: jest.fn(),
      deleteCourseById: jest.fn(),
      updateCourse: jest.fn(),
    };
    this.useCase = new CreateCourseUseCase(this.courseRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.body);
  }

  whenCreateCourseSucceeds() {
    this.courseRepository.createCourse.mockResolvedValue(
      this.createdCourse as any,
    );
  }

  whenCreateCourseFails() {
    this.courseRepository.createCourse.mockRejectedValue(this.repositoryError);
  }

  thenCreateCourseCalledWithExpectedPayload() {
    expect(this.courseRepository.createCourse).toHaveBeenCalledWith(this.body);
    expect(this.courseRepository.createCourse).toHaveBeenCalledTimes(1);
  }

  thenReturnCreatedCourse(result: unknown) {
    expect(result).toEqual(this.createdCourse);
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
