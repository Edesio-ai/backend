import {
  ForbiddenError,
  NotFoundError,
  ServerError,
} from 'src/domain/shared/errors/global.errors';
import type { ISelfLearnerCourseFileRepository } from 'src/domain/teaching/self-learner-course-file/contracts/i-self-learner-course-file.repository';
import type { ISelfLearnerCourseRepository } from 'src/domain/teaching/self-learner-course/contracts/i-self-learner-course.repository';
import type { ISelfLearnerRepository } from 'src/domain/teaching/self-learner/contracts/i-self-learner.repository';
import { createMockSelfLearnerCourseFileRepository } from 'src/testing/mock-self-learner-course-file-repository';
import { createMockSelfLearnerCourseRepository } from 'src/testing/mock-self-learner-course-repository';
import { createMockSelfLearnerRepository } from 'src/testing/mock-self-learner-repository';
import { GetSelfLearnerCourseFileSignedUrlUseCase } from './get-self-learner-course-file-signed-url.use-case';

describe('GetSelfLearnerCourseFileSignedUrlUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('returns signed URL from bucket with learner file storage path', async () => {
    fixtures.whenOwnershipOk();
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFileSignedUrl.mockResolvedValue(
      'https://signed.example/obj',
    );

    await expect(fixtures.whenExecute()).resolves.toBe(
      'https://signed.example/obj',
    );
    expect(
      fixtures.selfLearnerCourseFileRepository
        .getSelfLearnerCourseFileSignedUrl,
    ).toHaveBeenCalledWith(fixtures.fileRow.fileUrl);
  });

  it('returns null when storage layer reports no signedUrl', async () => {
    fixtures.whenOwnershipOk();
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFileSignedUrl.mockResolvedValue(
      null,
    );

    await expect(fixtures.whenExecute()).resolves.toBeNull();
  });

  it('does not resolve signed URL when learner is missing', async () => {
    fixtures.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(
      null,
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.selfLearnerCourseFileRepository
        .getSelfLearnerCourseFileSignedUrl,
    ).not.toHaveBeenCalled();
  });

  it('does not resolve signed URL when course file row is missing', async () => {
    fixtures.whenLearnerExists();
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFileById.mockResolvedValue(
      null as never,
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.selfLearnerCourseFileRepository
        .getSelfLearnerCourseFileSignedUrl,
    ).not.toHaveBeenCalled();
  });

  it('does not resolve signed URL when parent course is missing', async () => {
    fixtures.whenFileAndLearnerExist();
    fixtures.selfLearnerCourseRepository.getSelfLearnerCourseById.mockResolvedValue(
      null,
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(NotFoundError);
    expect(
      fixtures.selfLearnerCourseFileRepository
        .getSelfLearnerCourseFileSignedUrl,
    ).not.toHaveBeenCalled();
  });

  it('does not resolve signed URL when learner does not own the course', async () => {
    fixtures.whenFileAndLearnerExist();
    fixtures.selfLearnerCourseRepository.getSelfLearnerCourseById.mockResolvedValue(
      {
        ...fixtures.course,
        selfLearnerId: 'other',
      },
    );

    await expect(fixtures.whenExecute()).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      fixtures.selfLearnerCourseFileRepository
        .getSelfLearnerCourseFileSignedUrl,
    ).not.toHaveBeenCalled();
  });

  it('propagates storage errors after authorization', async () => {
    fixtures.whenOwnershipOk();
    const err = new ServerError('signed url rejected');
    fixtures.selfLearnerCourseFileRepository.getSelfLearnerCourseFileSignedUrl.mockRejectedValue(
      err,
    );

    await expect(fixtures.whenExecute()).rejects.toBe(err);
  });
});

class Fixtures {
  public readonly userId = 'auth-signed-1';
  public readonly fileId = 'scf-sign-1';

  public readonly learner = {
    id: 'sl-1',
    supabaseUserId: this.userId,
    name: 'A',
    email: 'a@test.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly fileRow = {
    id: this.fileId,
    courseId: 'c-own',
    fileUrl: 'self-learner/c-own/note.pdf',
    fileName: 'note.pdf',
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  public readonly course = {
    id: this.fileRow.courseId,
    selfLearnerId: this.learner.id,
    title: 'T',
    description: null as string | null,
    textContent: null as string | null,
    language: 'francais' as const,
    createdAt: '2026-01-03T00:00:00.000Z',
  };

  public readonly selfLearnerRepository: jest.Mocked<ISelfLearnerRepository>;
  public readonly selfLearnerCourseFileRepository: jest.Mocked<ISelfLearnerCourseFileRepository>;
  public readonly selfLearnerCourseRepository: jest.Mocked<ISelfLearnerCourseRepository>;
  public readonly useCase: GetSelfLearnerCourseFileSignedUrlUseCase;

  constructor() {
    this.selfLearnerRepository = createMockSelfLearnerRepository();
    this.selfLearnerCourseFileRepository =
      createMockSelfLearnerCourseFileRepository();
    this.selfLearnerCourseRepository = createMockSelfLearnerCourseRepository();

    this.useCase = new GetSelfLearnerCourseFileSignedUrlUseCase(
      this.selfLearnerRepository,
      this.selfLearnerCourseFileRepository,
      this.selfLearnerCourseRepository,
    );

    this.selfLearnerCourseFileRepository.getSelfLearnerCourseFileSignedUrl.mockResolvedValue(
      'https://default',
    );
  }

  whenExecute() {
    return this.useCase.execute(this.userId, this.fileId);
  }

  whenLearnerExists() {
    this.selfLearnerRepository.getSelfLearnerByUserId.mockResolvedValue(
      this.learner,
    );
  }

  whenFileAndLearnerExist() {
    this.whenLearnerExists();
    this.selfLearnerCourseFileRepository.getSelfLearnerCourseFileById.mockResolvedValue(
      this.fileRow,
    );
    this.selfLearnerCourseRepository.getSelfLearnerCourseById.mockResolvedValue(
      this.course,
    );
  }

  whenOwnershipOk() {
    this.whenFileAndLearnerExist();
  }
}
