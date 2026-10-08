import { SupabaseClient } from '@supabase/supabase-js';
import { CourseFileRepository } from './course-file-supabase.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';

describe('FileSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should fetch the file, remove it from storage, then delete the db row', async () => {
    fixtures.whenGetCourseFileByIdSucceeds();
    fixtures.whenRemoveFromStorageSucceeds();
    fixtures.whenDeleteFromDatabaseSucceeds();

    await fixtures.whenDeleteFileById();

    fixtures.thenGetFileQueryBuilt();
    fixtures.thenStorageRemoveCalledWithFileUrl();
    fixtures.thenDeleteFromDatabaseQueryBuilt();
  });

  it('should throw ServerError when getCourseFileById fails', async () => {
    fixtures.whenGetCourseFileByIdFails();

    const promise = fixtures.whenDeleteFileById();

    await fixtures.thenThrowServerError(promise);
    expect(fixtures.removeMock).not.toHaveBeenCalled();
    expect(fixtures.courseFilesDeleteEqMock).not.toHaveBeenCalled();
  });

  it('should throw ServerError when deleteFileFromStorage fails', async () => {
    fixtures.whenGetCourseFileByIdSucceeds();
    fixtures.whenRemoveFromStorageFails();

    const promise = fixtures.whenDeleteFileById();

    await fixtures.thenThrowServerError(promise);
    expect(fixtures.courseFilesDeleteEqMock).not.toHaveBeenCalled();
  });

  it('should throw ServerError when delete from database fails', async () => {
    fixtures.whenGetCourseFileByIdSucceeds();
    fixtures.whenRemoveFromStorageSucceeds();
    fixtures.whenDeleteFromDatabaseFails();

    const promise = fixtures.whenDeleteFileById();

    await fixtures.thenThrowServerError(promise);
  });

  it('should return mapped CourseFile when getCourseFileById succeeds', async () => {
    fixtures.whenGetCourseFileByIdSucceeds();

    const result = await fixtures.whenGetCourseFileById();

    fixtures.thenGetFileQueryBuilt();
    expect(result).toEqual(fixtures.expectedCourseFile);
  });

  it('should throw ServerError when getCourseFileById fails', async () => {
    fixtures.whenGetCourseFileByIdFails();

    const promise = fixtures.whenGetCourseFileById();

    await fixtures.thenThrowServerError(promise);
  });

  it('should return mapped CourseFiles when getCourseFilesByCourseId succeeds', async () => {
    fixtures.whenGetCourseFilesByCourseIdSucceeds();

    const result = await fixtures.whenGetCourseFilesByCourseId();

    fixtures.thenGetFilesByCourseIdQueryBuilt();
    expect(result).toEqual([fixtures.expectedCourseFile]);
  });

  it('should throw ServerError when getCourseFilesByCourseId fails', async () => {
    fixtures.whenGetCourseFilesByCourseIdFails();

    const promise = fixtures.whenGetCourseFilesByCourseId();

    await fixtures.thenThrowServerError(promise);
  });

  it('should return a signed URL from the courses-pdf bucket', async () => {
    fixtures.whenCreateSignedUrlSucceeds('https://signed.example/doc.pdf');

    const result = await fixtures.whenGetCourseFileSignedUrl();

    expect(fixtures.storageFromMock).toHaveBeenCalledWith('courses-pdf');
    expect(fixtures.createSignedUrlMock).toHaveBeenCalledWith(fixtures.fileUrl, 3600);
    expect(result).toBe('https://signed.example/doc.pdf');
  });

  it('should return null when Supabase omits signedUrl', async () => {
    fixtures.whenCreateSignedUrlSucceeds(undefined);

    await expect(fixtures.whenGetCourseFileSignedUrl()).resolves.toBeNull();
  });

  it('should throw ServerError when createSignedUrl fails', async () => {
    fixtures.whenCreateSignedUrlFails();

    await fixtures.thenThrowServerError(fixtures.whenGetCourseFileSignedUrl());
  });
});

class Fixtures {
  public readonly fileId = 'file-1';
  public readonly courseId = 'course-1';
  public readonly fileUrl = 'course-1/doc.pdf';

  public readonly supabaseCourseFileRow = {
    id: this.fileId,
    course_id: this.courseId,
    file_url: this.fileUrl,
    file_name: 'doc.pdf',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedCourseFile = {
    id: this.fileId,
    courseId: this.courseId,
    fileUrl: this.fileUrl,
    fileName: 'doc.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  private readonly courseFilesSelectSingleMock = jest.fn();
  private readonly courseFilesListEqMock = jest.fn();

  private readonly courseFilesSelectEqMock = jest.fn((col: string) => {
    if (col === 'course_id') {
      return this.courseFilesListEqMock();
    }
    return { single: this.courseFilesSelectSingleMock };
  });

  private readonly courseFilesSelectMock = jest.fn(() => ({
    eq: this.courseFilesSelectEqMock,
  }));

  public readonly courseFilesDeleteEqMock = jest.fn();
  private readonly courseFilesDeleteMock = jest.fn(() => ({
    eq: this.courseFilesDeleteEqMock,
  }));

  private readonly fromMock = jest.fn(() => ({
    select: this.courseFilesSelectMock,
    delete: this.courseFilesDeleteMock,
  }));

  public readonly removeMock = jest.fn();
  public readonly createSignedUrlMock = jest.fn();
  public readonly storageFromMock = jest.fn(() => ({
    remove: this.removeMock,
    createSignedUrl: this.createSignedUrlMock,
  }));

  public readonly repository: CourseFileRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
      storage: { from: this.storageFromMock },
    };
    this.repository = new CourseFileRepository(supabaseMock as unknown as SupabaseClient);
  }

  whenDeleteFileById() {
    return this.repository.deleteFileById(this.fileId);
  }

  whenGetCourseFileById() {
    return this.repository.getCourseFileById(this.fileId);
  }

  whenGetCourseFilesByCourseId() {
    return this.repository.getCourseFilesByCourseId(this.courseId);
  }

  whenGetCourseFileSignedUrl() {
    return this.repository.getCourseFileSignedUrl(this.fileUrl);
  }

  whenCreateSignedUrlSucceeds(signedUrl?: string) {
    this.createSignedUrlMock.mockResolvedValue({
      data: signedUrl === undefined ? {} : { signedUrl },
      error: null,
    });
  }

  whenCreateSignedUrlFails() {
    this.createSignedUrlMock.mockResolvedValue({
      data: null,
      error: { message: 'signed url failed' },
    });
  }

  whenGetCourseFileByIdSucceeds() {
    this.courseFilesSelectSingleMock.mockResolvedValue({
      data: this.supabaseCourseFileRow,
      error: null,
    });
  }

  whenGetCourseFileByIdFails() {
    this.courseFilesSelectSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'file not found' },
    });
  }

  whenGetCourseFilesByCourseIdSucceeds() {
    this.courseFilesListEqMock.mockReturnValue(Promise.resolve({ data: [this.supabaseCourseFileRow], error: null }));
  }

  whenGetCourseFilesByCourseIdFails() {
    this.courseFilesListEqMock.mockReturnValue(
      Promise.resolve({ data: null, error: { message: 'list query failed' } }),
    );
  }

  whenRemoveFromStorageSucceeds() {
    this.removeMock.mockResolvedValue({ error: null });
  }

  whenRemoveFromStorageFails() {
    this.removeMock.mockResolvedValue({
      error: { message: 'storage remove failed' },
    });
  }

  whenDeleteFromDatabaseSucceeds() {
    this.courseFilesDeleteEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteFromDatabaseFails() {
    this.courseFilesDeleteEqMock.mockResolvedValue({
      error: { message: 'db delete failed' },
    });
  }

  async thenThrowServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(ServerError);
  }

  thenGetFileQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_files');
    expect(this.courseFilesSelectMock).toHaveBeenCalledWith('*');
    expect(this.courseFilesSelectEqMock).toHaveBeenCalledWith('id', this.fileId);
    expect(this.courseFilesSelectSingleMock).toHaveBeenCalledTimes(1);
  }

  thenGetFilesByCourseIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_files');
    expect(this.courseFilesSelectMock).toHaveBeenCalledWith('*');
    expect(this.courseFilesSelectEqMock).toHaveBeenCalledWith('course_id', this.courseId);
  }

  thenStorageRemoveCalledWithFileUrl() {
    expect(this.storageFromMock).toHaveBeenCalledWith('courses-pdf');
    expect(this.removeMock).toHaveBeenCalledWith([this.fileUrl]);
  }

  thenDeleteFromDatabaseQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_files');
    expect(this.courseFilesDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.courseFilesDeleteEqMock).toHaveBeenCalledWith('id', this.fileId);
  }
}
