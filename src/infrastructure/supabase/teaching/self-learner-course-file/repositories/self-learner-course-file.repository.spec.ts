import { SupabaseClient } from '@supabase/supabase-js';
import { SelfLearnerCourseFileRepository } from './self-learner-course-file.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';
import { selfLearnerCourseFileMapper } from '../mappers/self-learner-course-file.mapper';

describe('SelfLearnerCourseFileRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('inserts mapped payload and returns domain row', async () => {
    fixtures.whenInsertSucceeds();

    const result = await fixtures.whenUpload();

    expect(result).toEqual(
      selfLearnerCourseFileMapper.toDomain(fixtures.supabaseRow),
    );
    expect(fixtures.insertMock).toHaveBeenCalledWith(
      selfLearnerCourseFileMapper.toInsert(fixtures.payload),
    );
    expect(fixtures.singleAfterInsertMock).toHaveBeenCalledTimes(1);
  });

  it('throws ServerError when insert fails', async () => {
    fixtures.whenInsertFails('violates FK');

    await expect(fixtures.whenUpload()).rejects.toBeInstanceOf(ServerError);
  });
});

class Fixtures {
  public readonly payload = {
    courseId: 'c-1',
    fileUrl: 'self-learner/c-1/doc.pdf',
    fileName: 'doc.pdf',
  };

  public readonly supabaseRow = {
    id: 'scf-1',
    course_id: this.payload.courseId,
    file_url: this.payload.fileUrl,
    file_name: this.payload.fileName,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly fromMock = jest.fn();
  public readonly insertMock = jest.fn();
  public readonly selectAfterInsertMock = jest.fn();
  public readonly singleAfterInsertMock = jest.fn();

  public readonly repository: SelfLearnerCourseFileRepository;

  constructor() {
    this.repository = new SelfLearnerCourseFileRepository({
      from: this.fromMock,
    } as unknown as SupabaseClient);
  }

  whenUpload() {
    return this.repository.uploadSelfLearnerCourseFile(this.payload);
  }

  whenInsertSucceeds() {
    this.singleAfterInsertMock.mockResolvedValue({
      data: this.supabaseRow,
      error: null,
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterInsertMock,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }

  whenInsertFails(message: string) {
    this.singleAfterInsertMock.mockResolvedValue({
      data: null,
      error: { message },
    });
    this.selectAfterInsertMock.mockReturnValue({
      single: this.singleAfterInsertMock,
    });
    this.insertMock.mockReturnValue({
      select: this.selectAfterInsertMock,
    });
    this.fromMock.mockReturnValue({ insert: this.insertMock });
  }
}
