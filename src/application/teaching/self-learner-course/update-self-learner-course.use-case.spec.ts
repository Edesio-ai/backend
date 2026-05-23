import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import {
  type UpdateSelfLearnerCourseBody,
  UpdateSelfLearnerCourseUseCase,
} from './update-self-learner-course.use-case';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';

describe('UpdateSelfLearnerCourseUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('updates course when learner owns it', async () => {
    fixtures.whenLearnerExists();
    fixtures.whenCourseOwnedByLearner();
    fixtures.whenUpdateSucceeds();

    const result = await fixtures.whenExecute();

    expect(
      fixtures.selfLearnerRepo.getSelfLearnerByUserId,
    ).toHaveBeenCalledWith(fixtures.userId);
    expect(fixtures.courseRepo.getSelfLearnerCourseById).toHaveBeenCalledWith(
      fixtures.courseId,
    );
    expect(fixtures.courseRepo.updateSelfLearnerCourse).toHaveBeenCalledWith(
      fixtures.courseId,
      fixtures.body,
    );
    expect(result).toEqual(fixtures.updatedCourse);
  });

  it('throws NotFoundError when learner profile is missing', async () => {
    fixtures.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(null);

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.courseRepo.updateSelfLearnerCourse).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when course is missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue(null);

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.courseRepo.updateSelfLearnerCourse).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when course belongs to another learner', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue({
      ...fixtures.course,
      selfLearnerId: 'other-sl',
    });

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.courseRepo.updateSelfLearnerCourse).not.toHaveBeenCalled();
  });

  it('propagates repository errors on update', async () => {
    fixtures.whenLearnerExists();
    fixtures.whenCourseOwnedByLearner();
    const err = new Error('update failed');
    fixtures.courseRepo.updateSelfLearnerCourse.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly userId = 'auth-1';
  public readonly courseId = 'course-1';

  public readonly body: UpdateSelfLearnerCourseBody = {
    title: 'Nouveau titre',
    description: 'Suite',
    contentText: 'Corps enrichi',
  };

  public readonly learner = {
    id: 'sl-1',
    supabaseUserId: this.userId,
    name: 'A',
    email: 'a@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly course = {
    id: this.courseId,
    selfLearnerId: this.learner.id,
    title: 'Ancien',
    description: null as string | null,
    textContent: null as string | null,
    language: 'francais' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly updatedCourse = {
    ...this.course,
    title: this.body.title!,
    description: this.body.description,
    textContent: this.body.contentText,
  };

  public readonly selfLearnerRepo: jest.Mocked<ISelfLearnerRepository>;
  public readonly courseRepo: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly useCase: UpdateSelfLearnerCourseUseCase;

  constructor() {
    this.selfLearnerRepo = createMockSelfLearnerRepository();
    this.courseRepo = createMockSelfLearnerCourseRepository();
    this.useCase = new UpdateSelfLearnerCourseUseCase(
      this.selfLearnerRepo,
      this.courseRepo,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.courseId, this.body);
  }

  whenLearnerExists() {
    this.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(this.learner);
  }

  whenCourseOwnedByLearner() {
    this.courseRepo.getSelfLearnerCourseById.mockResolvedValue(this.course);
  }

  whenUpdateSucceeds() {
    this.courseRepo.updateSelfLearnerCourse.mockResolvedValue(
      this.updatedCourse,
    );
  }
}
