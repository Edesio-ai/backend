import { GetCoursesSessionCountUseCase } from './get-courses-session-count.use-case';
import { ICourseRepository } from 'src/domain/teaching/course/contracts/i-course.repository';
import { createMockCourseRepository } from 'src/testing/mock-course-repository';

describe('GetCoursesSessionCountUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return session courses count from repository', async () => {
    fixtures.whenCountReturns(4);

    const result = await fixtures.whenExecute();

    expect(result).toBe(4);
    fixtures.thenRepositoryCalledWithSessionId();
  });

  it('should propagate repository errors', async () => {
    fixtures.whenCountFails();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly repositoryError = new Error('count query failed');

  public readonly courseRepository: jest.Mocked<ICourseRepository>;
  public readonly useCase: GetCoursesSessionCountUseCase;

  constructor() {
    this.courseRepository = createMockCourseRepository();
    this.useCase = new GetCoursesSessionCountUseCase(this.courseRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.sessionId);
  }

  whenCountReturns(n: number) {
    this.courseRepository.getSessionCoursesCount.mockResolvedValue(n);
  }

  whenCountFails() {
    this.courseRepository.getSessionCoursesCount.mockRejectedValue(
      this.repositoryError,
    );
  }

  thenRepositoryCalledWithSessionId() {
    expect(this.courseRepository.getSessionCoursesCount).toHaveBeenCalledWith(
      this.sessionId,
    );
    expect(this.courseRepository.getSessionCoursesCount).toHaveBeenCalledTimes(
      1,
    );
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }
}
