import { NotFoundException } from '@nestjs/common';
import { GetSelfLearnerCoursesCountUseCase } from './get-self-learner-courses-count.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';

describe('GetSelfLearnerCoursesCountUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return count when self learner exists', async () => {
    fixtures.whenSelfLearnerFound();
    fixtures.courseRepository.getSelfLearnerCoursesCount.mockResolvedValue(7);

    const result = await fixtures.whenExecute();

    expect(fixtures.courseRepository.getSelfLearnerCoursesCount).toHaveBeenCalledWith(fixtures.selfLearner.id);
    expect(result).toEqual({ count: 7 });
  });

  it('should throw NotFoundException when self learner is missing', async () => {
    fixtures.whenSelfLearnerNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    expect(fixtures.courseRepository.getSelfLearnerCoursesCount).not.toHaveBeenCalled();
  });

  it('should propagate errors from course repository', async () => {
    fixtures.whenSelfLearnerFound();
    const err = new Error('count failed');
    fixtures.courseRepository.getSelfLearnerCoursesCount.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly user: AuthUser = {
    id: 'user-1',
    email: 'sl@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { role: 'self-learner', firstname: 'A', lastname: 'B' },
  };

  public readonly selfLearner = {
    id: 'sl-1',
    supabaseUserId: this.user.id,
    name: 'A B',
    email: this.user.email,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly courseRepository: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly selfLearnerRepository: jest.Mocked<ISelfLearnerRepository>;
  public readonly useCase: GetSelfLearnerCoursesCountUseCase;

  constructor() {
    this.courseRepository = createMockSelfLearnerCourseRepository();
    this.selfLearnerRepository = createMockSelfLearnerRepository();
    this.useCase = new GetSelfLearnerCoursesCountUseCase(this.courseRepository, this.selfLearnerRepository);
  }

  whenExecute() {
    return this.useCase.execute(this.user);
  }

  whenSelfLearnerFound() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(this.selfLearner);
  }

  whenSelfLearnerNotFound() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(null);
  }
}
