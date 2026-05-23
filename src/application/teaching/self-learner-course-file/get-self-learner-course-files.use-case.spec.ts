import {
  ForbiddenError,
  NotFoundError,
} from 'src/domain/shared/errors/global.errors';
import { GetSelfLearnerCourseFilesUseCase } from './get-self-learner-course-files.use-case';
import type { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import type { SelfLearnerCourseFile } from 'src/domain/teaching/self-learner-course-file/types/self-learner-course-file.type';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockSelfLearnerCourseFileRepository } from 'src/testing/mock-self-learner-course-file-repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';

describe('GetSelfLearnerCourseFilesUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('returns files when self learner owns the course', async () => {
    fixtures.whenLearnerExists();
    fixtures.whenCourseBelongsToLearner();
    fixtures.whenFilesFound();

    const result = await fixtures.whenExecute();

    expect(
      fixtures.selfLearnerRepo.getSelfLearnerByUserId,
    ).toHaveBeenCalledWith(fixtures.userId);
    expect(fixtures.courseRepo.getSelfLearnerCourseById).toHaveBeenCalledWith(
      fixtures.courseId,
    );
    expect(fixtures.fileRepo.getSelfLearnerCourseFiles).toHaveBeenCalledWith(
      fixtures.courseId,
    );
    expect(result).toEqual(fixtures.files);
  });

  it('throws NotFoundError when user has no self-learner profile', async () => {
    fixtures.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(null);

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.courseRepo.getSelfLearnerCourseById).not.toHaveBeenCalled();
    expect(fixtures.fileRepo.getSelfLearnerCourseFiles).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when course does not exist', async () => {
    fixtures.whenLearnerExists();
    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue(null);

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    expect(fixtures.fileRepo.getSelfLearnerCourseFiles).not.toHaveBeenCalled();
  });

  it('throws ForbiddenError when course belongs to another learner', async () => {
    fixtures.whenLearnerExists();

    fixtures.courseRepo.getSelfLearnerCourseById.mockResolvedValue({
      id: fixtures.courseId,
      selfLearnerId: 'other-sl',
      title: 'T',
      description: null,
      textContent: null,
      language: 'francais',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const promise = fixtures.whenExecute();

    await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
    expect(fixtures.fileRepo.getSelfLearnerCourseFiles).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    fixtures.whenLearnerExists();
    fixtures.whenCourseBelongsToLearner();
    const err = new Error('storage failing');
    fixtures.fileRepo.getSelfLearnerCourseFiles.mockRejectedValue(err);

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly userId = 'auth-user-1';
  public readonly courseId = 'sl-course-1';

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
    title: 'Cours perso',
    description: null,
    textContent: null,
    language: 'francais' as const,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly files: SelfLearnerCourseFile[] = [
    {
      id: 'f-1',
      courseId: this.courseId,
      fileUrl: 'x/a.pdf',
      fileName: 'a.pdf',
      createdAt: '2026-01-03T00:00:00.000Z',
    },
  ];

  public readonly fileRepo: jest.Mocked<ISelfLearnerCourseFileRepository>;
  public readonly selfLearnerRepo: jest.Mocked<ISelfLearnerRepository>;
  public readonly courseRepo: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly useCase: GetSelfLearnerCourseFilesUseCase;

  constructor() {
    this.fileRepo = createMockSelfLearnerCourseFileRepository();
    this.selfLearnerRepo = createMockSelfLearnerRepository();
    this.courseRepo = createMockSelfLearnerCourseRepository();
    this.useCase = new GetSelfLearnerCourseFilesUseCase(
      this.fileRepo,
      this.selfLearnerRepo,
      this.courseRepo,
    );
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.courseId);
  }

  whenLearnerExists() {
    this.selfLearnerRepo.getSelfLearnerByUserId.mockResolvedValue(this.learner);
  }

  whenCourseBelongsToLearner() {
    this.courseRepo.getSelfLearnerCourseById.mockResolvedValue(this.course);
  }

  whenFilesFound() {
    this.fileRepo.getSelfLearnerCourseFiles.mockResolvedValue(this.files);
  }
}
