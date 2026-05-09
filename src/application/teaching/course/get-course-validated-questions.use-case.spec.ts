import { GetCourseValidatedQuestionsUseCase } from './get-course-validated-questions.use-case';
import { CourseRepository } from 'src/domain/teaching/interfaces/course.repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';

describe('GetCourseValidatedQuestionsUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return validated questions flag from repository', async () => {
    fixtures.whenRepositoryReturns({ validatedQuestions: true });

    const result = await fixtures.whenExecute();

    expect(result).toEqual({ validatedQuestions: true });
    expect(
      fixtures.courseRepository.getCourseValidatedQuestions,
    ).toHaveBeenCalledWith(fixtures.courseId);
  });

  it('should propagate repository errors', async () => {
    fixtures.whenRepositoryThrows();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBe(fixtures.repositoryError);
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly repositoryError = new Error('validated query failed');

  public readonly courseRepository: jest.Mocked<CourseRepository>;
  public readonly useCase: GetCourseValidatedQuestionsUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();

    this.useCase = new GetCourseValidatedQuestionsUseCase(
      this.courseRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.courseId);
  }

  whenRepositoryReturns(value: { validatedQuestions: boolean }) {
    this.courseRepository.getCourseValidatedQuestions.mockResolvedValue(value);
  }

  whenRepositoryThrows() {
    this.courseRepository.getCourseValidatedQuestions.mockRejectedValue(
      this.repositoryError,
    );
  }
}
