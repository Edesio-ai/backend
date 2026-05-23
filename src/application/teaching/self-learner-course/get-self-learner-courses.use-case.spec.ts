import { NotFoundException } from '@nestjs/common';
import { GetSelfLearnerCoursesUseCase } from './get-self-learner-courses.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import type { SelfLearnerCourse } from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';

describe('GetSelfLearnerCoursesUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should resolve self learner then return courses', async () => {
    fixtures.whenSelfLearnerFound();
    fixtures.whenCoursesFound();

    const result = await fixtures.whenExecute();

    expect(
      fixtures.selfLearnerRepository.getSelfLearnerByUserId,
    ).toHaveBeenCalledWith(fixtures.user.id);
    expect(
      fixtures.courseRepository.getSelfLearnerCourses,
    ).toHaveBeenCalledWith(fixtures.selfLearner.id);
    expect(result).toEqual(fixtures.courses);
  });

  it('should throw NotFoundException when self learner is missing', async () => {
    fixtures.whenSelfLearnerNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    await expect(promise).rejects.toThrow('Self learner not found');
    expect(
      fixtures.courseRepository.getSelfLearnerCourses,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from self learner repository', async () => {
    const err = new Error('lookup failed');
    fixtures.selfLearnerRepository.getSelfLearnerByUserId.mockRejectedValue(
      err,
    );

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });

  it('should propagate errors from course repository', async () => {
    fixtures.whenSelfLearnerFound();
    const err = new Error('courses failed');
    fixtures.courseRepository.getSelfLearnerCourses.mockRejectedValue(err);

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

  public readonly courses: SelfLearnerCourse[] = [
    {
      id: 'c-1',
      selfLearnerId: this.selfLearner.id,
      title: 'Mon cours',
      description: null,
      textContent: null,
      language: 'francais',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  public readonly selfLearnerRepository: jest.Mocked<ISelfLearnerRepository>;
  public readonly courseRepository: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly useCase: GetSelfLearnerCoursesUseCase;

  constructor() {
    this.selfLearnerRepository = createMockSelfLearnerRepository();
    this.courseRepository = createMockSelfLearnerCourseRepository();

    this.useCase = new GetSelfLearnerCoursesUseCase(
      this.courseRepository,
      this.selfLearnerRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.user);
  }

  whenSelfLearnerFound() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(
      this.selfLearner,
    );
  }

  whenSelfLearnerNotFound() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(null);
  }

  whenCoursesFound() {
    this.courseRepository.getSelfLearnerCourses.mockResolvedValue(this.courses);
  }
}
