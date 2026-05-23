import { NotFoundException } from '@nestjs/common';
import {
  CreateSelfLearnerCourseUseCase,
  type CreateSelfLearnerCourseBody,
} from './create-self-learner-course.use-case';
import { AuthUser } from 'src/domain/auth/types/auth.type';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import type { SelfLearnerCourse } from 'src/domain/teaching/self-learner-course/types/self-learner-course.type';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';

describe('CreateSelfLearnerCourseUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should resolve self learner and create course with mapped textContent', async () => {
    fixtures.whenSelfLearnerFound();
    fixtures.whenCreateSucceeds();

    const result = await fixtures.whenExecute();

    expect(
      fixtures.selfLearnerRepository.getSelfLearnerByUserId,
    ).toHaveBeenCalledWith(fixtures.user.id);
    expect(
      fixtures.courseRepository.createSelfLearnerCourse,
    ).toHaveBeenCalledWith({
      selfLearnerId: fixtures.selfLearner.id,
      title: fixtures.body.title,
      description: fixtures.body.description ?? null,
      textContent: fixtures.body.contentText ?? null,
      language: fixtures.body.language,
    });
    expect(result).toEqual(fixtures.createdCourse);
  });

  it('should throw NotFoundException when self learner is missing', async () => {
    fixtures.whenSelfLearnerNotFound();

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    expect(
      fixtures.courseRepository.createSelfLearnerCourse,
    ).not.toHaveBeenCalled();
  });

  it('should propagate errors from repositories', async () => {
    fixtures.whenSelfLearnerFound();
    const err = new Error('insert denied');
    fixtures.courseRepository.createSelfLearnerCourse.mockRejectedValue(err);

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

  public readonly body: CreateSelfLearnerCourseBody = {
    title: 'Mon parcours',
    description: 'Desc',
    contentText: 'Long text…',
    language: 'francais',
  };

  public readonly createdCourse: SelfLearnerCourse = {
    id: 'c-new',
    selfLearnerId: this.selfLearner.id,
    title: this.body.title,
    description: this.body.description ?? null,
    textContent: this.body.contentText ?? null,
    language: this.body.language,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly courseRepository: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly selfLearnerRepository: jest.Mocked<ISelfLearnerRepository>;
  public readonly useCase: CreateSelfLearnerCourseUseCase;

  constructor() {
    this.courseRepository = createMockSelfLearnerCourseRepository();
    this.selfLearnerRepository = createMockSelfLearnerRepository();
    this.useCase = new CreateSelfLearnerCourseUseCase(
      this.courseRepository,
      this.selfLearnerRepository,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.user, this.body);
  }

  whenSelfLearnerFound() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(
      this.selfLearner,
    );
  }

  whenSelfLearnerNotFound() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(null);
  }

  whenCreateSucceeds() {
    this.courseRepository.createSelfLearnerCourse.mockResolvedValue(
      this.createdCourse,
    );
  }
}
