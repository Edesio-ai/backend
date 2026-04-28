import { FileSupabaseRepository } from './file-supabase.repository';
import { ServerError } from 'src/domain/shared/global/errors/global.errors';

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
});

class Fixtures {
  public readonly fileId = 'file-1';
  public readonly fileUrl = 'course-1/doc.pdf';

  public readonly supabaseCourseFileRow = {
    id: this.fileId,
    course_id: 'course-1',
    file_url: this.fileUrl,
    file_name: 'doc.pdf',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  private readonly courseFilesSelectSingleMock = jest.fn();
  private readonly courseFilesSelectEqMock = jest.fn(() => ({
    single: this.courseFilesSelectSingleMock,
  }));
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
  private readonly storageFromMock = jest.fn(() => ({
    remove: this.removeMock,
  }));

  public readonly repository: FileSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
      storage: { from: this.storageFromMock },
    };
    this.repository = new FileSupabaseRepository(supabaseMock as any);
  }

  whenDeleteFileById() {
    return this.repository.deleteFileById(this.fileId);
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
    expect(this.courseFilesSelectEqMock).toHaveBeenCalledWith(
      'id',
      this.fileId,
    );
    expect(this.courseFilesSelectSingleMock).toHaveBeenCalledTimes(1);
  }

  thenStorageRemoveCalledWithFileUrl() {
    expect(this.storageFromMock).toHaveBeenCalledWith('courses-pdf');
    expect(this.removeMock).toHaveBeenCalledWith([this.fileUrl]);
  }

  thenDeleteFromDatabaseQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_files');
    expect(this.courseFilesDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.courseFilesDeleteEqMock).toHaveBeenCalledWith(
      'id',
      this.fileId,
    );
  }
}
