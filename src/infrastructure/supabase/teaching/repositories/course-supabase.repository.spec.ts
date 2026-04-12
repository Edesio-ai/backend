import { CourseServerError } from 'src/domain/teaching/error';
import { CourseSupabaseRepository } from '../modules/course-persistance.repository';
import { CreateCourseBody } from 'src/domain/teaching/types/course.type';

describe('CourseSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return courses id list for session', async () => {
    fixtures.whenGetCoursesSucceeds();

    const result = await fixtures.whenGetCoursesBySessionId();

    fixtures.thenGetCoursesQueryBuilt();
    fixtures.thenReturnsCourseIds(result);
  });

  it('should throw CourseServerError when getCoursesBySessionId fails', async () => {
    fixtures.whenGetCoursesFails();

    const promise = fixtures.whenGetCoursesBySessionId();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should delete courses by session id', async () => {
    fixtures.whenDeleteCoursesBySessionSucceeds();

    await fixtures.whenDeleteCoursesBySessionId();

    fixtures.thenDeleteCoursesBySessionQueryBuilt();
  });

  it('should throw CourseServerError when deleteCoursesBySessionId fails', async () => {
    fixtures.whenDeleteCoursesBySessionFails();

    const promise = fixtures.whenDeleteCoursesBySessionId();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should load file paths and remove them from storage', async () => {
    fixtures.whenCourseFilesThenEmpty();
    fixtures.whenRemoveFromStorageSucceeds();

    await fixtures.whenDeleteCoursesFilesByCourseIds();

    fixtures.thenStorageRemoveCalledWithPaths();
  });

  it('should not call storage remove when no files', async () => {
    fixtures.whenCourseFilesAlwaysEmpty();

    await fixtures.whenDeleteCoursesFilesByCourseIds();

    expect(fixtures.removeMock).not.toHaveBeenCalled();
  });

  it('should throw CourseServerError when course_files select fails', async () => {
    fixtures.whenCourseFilesQueryFails();

    const promise = fixtures.whenDeleteCoursesFilesByCourseIds();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should throw CourseServerError when storage remove fails', async () => {
    fixtures.whenCourseFilesReturnsPaths();
    fixtures.whenRemoveFromStorageFails();

    const promise = fixtures.whenDeleteCoursesFilesByCourseIds();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should return count for getSessionCoursesCount', async () => {
    fixtures.whenSessionCoursesCountSucceeds(7);

    const result = await fixtures.whenGetSessionCoursesCount();

    expect(result).toBe(7);
    fixtures.thenSessionCoursesCountQueryBuilt();
  });

  it('should throw CourseServerError when getSessionCoursesCount fails', async () => {
    fixtures.whenSessionCoursesCountFails();

    const promise = fixtures.whenGetSessionCoursesCount();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should create course with mapped columns', async () => {
    fixtures.whenCreateCourseSucceeds();

    const result = await fixtures.whenCreateCourse();

    fixtures.thenCreateCourseInsertBuilt();
    fixtures.thenReturnsCreatedCourse(result);
  });

  it('should throw CourseServerError when createCourse fails', async () => {
    fixtures.whenCreateCourseFails();

    const promise = fixtures.whenCreateCourse();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should upload file to storage', async () => {
    fixtures.whenUploadSucceeds();

    await fixtures.whenStoreCourseFile();

    fixtures.thenUploadBuiltWithExpectedArgs();
  });

  it('should throw CourseServerError when upload fails', async () => {
    fixtures.whenUploadFails();

    const promise = fixtures.whenStoreCourseFile();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should insert course file row', async () => {
    fixtures.whenInsertCourseFileSucceeds();

    const result = await fixtures.whenInsertCourseFile();

    fixtures.thenInsertCourseFileBuilt();
    fixtures.thenReturnsInsertedCourseFile(result);
  });

  it('should remove uploaded file and throw when insertCourseFile fails', async () => {
    fixtures.whenInsertCourseFileFails();

    const promise = fixtures.whenInsertCourseFile();

    await fixtures.thenThrowCourseServerError(promise);
    fixtures.thenRemoveCalledAfterInsertFailure();
  });
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly courseIds = ['course-1', 'course-2'];
  public readonly coursesData = [{ id: 'course-1' }, { id: 'course-2' }];

  public readonly createBody: CreateCourseBody = {
    sessionId: 'session-1',
    title: 'Titre',
    description: 'D',
    contentText: 'Contenu',
  };

  public readonly createdCourseSupabaseRow = {
    id: 'new-course',
    session_id: this.createBody.sessionId,
    title: this.createBody.title,
    description: this.createBody.description,
    text_content: this.createBody.contentText,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedCreatedCourse = {
    id: 'new-course',
    sessionId: this.createBody.sessionId,
    title: this.createBody.title,
    description: this.createBody.description,
    contentText: this.createBody.contentText,
    validatedQuestions: undefined,
    positionOrder: undefined,
  };

  public readonly courseId = 'course-1';
  public readonly storagePath = 'course-1/doc.pdf';
  public readonly fileUpload = {
    buffer: Buffer.from('x'),
    originalFileName: 'doc.pdf',
    mimeType: 'application/pdf',
    byteLength: 1,
  };

  public readonly insertedCourseFileSupabaseRow = {
    id: 'cf-1',
    course_id: this.courseId,
    file_url: this.storagePath,
    file_name: 'doc.pdf',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedCourseFile = {
    id: 'cf-1',
    courseId: this.courseId,
    fileUrl: this.storagePath,
    fileName: 'doc.pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  private readonly coursesListEqMock = jest.fn();
  private readonly coursesCountEqMock = jest.fn();
  private readonly coursesSelectMock = jest.fn(
    (first: string, second?: object) => {
      if (second && typeof second === 'object' && 'count' in second) {
        return { eq: this.coursesCountEqMock };
      }
      return { eq: this.coursesListEqMock };
    },
  );

  private readonly coursesDeleteEqMock = jest.fn();
  private readonly coursesDeleteMock = jest.fn(() => ({
    eq: this.coursesDeleteEqMock,
  }));

  private readonly coursesInsertSingleMock = jest.fn();
  private readonly coursesInsertSelectMock = jest.fn(() => ({
    single: this.coursesInsertSingleMock,
  }));
  private readonly coursesInsertMock = jest.fn(() => ({
    select: this.coursesInsertSelectMock,
  }));

  private readonly courseFilesEqMock = jest.fn();
  private readonly courseFilesSelectMock = jest.fn(() => ({
    eq: this.courseFilesEqMock,
  }));

  private readonly courseFilesInsertSingleMock = jest.fn();
  private readonly courseFilesInsertSelectMock = jest.fn(() => ({
    single: this.courseFilesInsertSingleMock,
  }));
  private readonly courseFilesInsertMock = jest.fn(() => ({
    select: this.courseFilesInsertSelectMock,
  }));

  public readonly removeMock = jest.fn();
  public readonly uploadMock = jest.fn();
  private readonly storageFromMock = jest.fn(() => ({
    remove: this.removeMock,
    upload: this.uploadMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'courses') {
      return {
        select: this.coursesSelectMock,
        delete: this.coursesDeleteMock,
        insert: this.coursesInsertMock,
      };
    }
    if (table === 'course_files') {
      return {
        select: this.courseFilesSelectMock,
        insert: this.courseFilesInsertMock,
      };
    }
    throw new Error(`unexpected table: ${table}`);
  });

  public readonly repository: CourseSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
      storage: { from: this.storageFromMock },
    };
    this.repository = new CourseSupabaseRepository(supabaseMock as any);
  }

  whenGetCoursesBySessionId() {
    return this.repository.getCoursesBySessionId(this.sessionId);
  }

  whenDeleteCoursesBySessionId() {
    return this.repository.deleteCoursesBySessionId(this.sessionId);
  }

  whenDeleteCoursesFilesByCourseIds() {
    return this.repository.deleteCoursesFilesByCourseIds(this.courseIds);
  }

  whenGetSessionCoursesCount() {
    return this.repository.getSessionCoursesCount(this.sessionId);
  }

  whenCreateCourse() {
    return this.repository.createCourse(this.createBody);
  }

  whenStoreCourseFile() {
    return this.repository.storeCourseFile(
      this.fileUpload as any,
      this.storagePath,
    );
  }

  whenInsertCourseFile() {
    return this.repository.insertCourseFile(
      this.courseId,
      this.fileUpload as any,
      this.storagePath,
    );
  }

  whenGetCoursesSucceeds() {
    this.coursesListEqMock.mockResolvedValue({
      data: this.coursesData,
      error: null,
    });
  }

  whenGetCoursesFails() {
    this.coursesListEqMock.mockResolvedValue({
      data: null,
      error: { message: 'courses query failed' },
    });
  }

  whenDeleteCoursesBySessionSucceeds() {
    this.coursesDeleteEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteCoursesBySessionFails() {
    this.coursesDeleteEqMock.mockResolvedValue({
      error: { message: 'delete courses failed' },
    });
  }

  whenCourseFilesThenEmpty() {
    this.courseFilesEqMock
      .mockResolvedValueOnce({
        data: [{ file_url: 'a.pdf' }, { file_url: 'b.pdf' }],
        error: null,
      })
      .mockResolvedValueOnce({ data: [], error: null });
  }

  whenCourseFilesAlwaysEmpty() {
    this.courseFilesEqMock.mockResolvedValue({ data: [], error: null });
  }

  whenCourseFilesReturnsPaths() {
    this.courseFilesEqMock.mockResolvedValue({
      data: [{ file_url: 'x.pdf' }],
      error: null,
    });
  }

  whenCourseFilesQueryFails() {
    this.courseFilesEqMock.mockResolvedValue({
      data: null,
      error: { message: 'course_files failed' },
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

  whenSessionCoursesCountSucceeds(count: number) {
    this.coursesCountEqMock.mockResolvedValue({ count, error: null });
  }

  whenSessionCoursesCountFails() {
    this.coursesCountEqMock.mockResolvedValue({
      count: null,
      error: { message: 'count failed' },
    });
  }

  whenCreateCourseSucceeds() {
    this.coursesInsertSingleMock.mockResolvedValue({
      data: this.createdCourseSupabaseRow,
      error: null,
    });
  }

  whenCreateCourseFails() {
    this.coursesInsertSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'insert course failed' },
    });
  }

  whenUploadSucceeds() {
    this.uploadMock.mockResolvedValue({ error: null });
  }

  whenUploadFails() {
    this.uploadMock.mockResolvedValue({
      error: { message: 'Bucket not found' },
    });
  }

  whenInsertCourseFileSucceeds() {
    this.courseFilesInsertSingleMock.mockResolvedValue({
      data: this.insertedCourseFileSupabaseRow,
      error: null,
    });
  }

  whenInsertCourseFileFails() {
    this.courseFilesInsertSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'insert row failed' },
    });
    this.removeMock.mockResolvedValue({ error: null });
  }

  async thenThrowCourseServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(CourseServerError);
  }

  thenGetCoursesQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesSelectMock).toHaveBeenCalledWith('id');
    expect(this.coursesListEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionId,
    );
  }

  thenReturnsCourseIds(result: unknown) {
    expect(result).toEqual(this.coursesData);
  }

  thenDeleteCoursesBySessionQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.coursesDeleteEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionId,
    );
  }

  thenStorageRemoveCalledWithPaths() {
    expect(this.storageFromMock).toHaveBeenCalledWith('courses-pdf');
    expect(this.removeMock).toHaveBeenCalledWith(['a.pdf', 'b.pdf']);
    expect(this.removeMock).toHaveBeenCalledTimes(1);
  }

  thenSessionCoursesCountQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesSelectMock).toHaveBeenCalledWith('*', {
      count: 'exact',
      head: true,
    });
    expect(this.coursesCountEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionId,
    );
  }

  thenCreateCourseInsertBuilt() {
    expect(this.coursesInsertMock).toHaveBeenCalledWith({
      session_id: this.createBody.sessionId,
      title: this.createBody.title,
      description: this.createBody.description,
      text_content: this.createBody.contentText,
    });
    expect(this.coursesInsertSelectMock).toHaveBeenCalledTimes(1);
    expect(this.coursesInsertSingleMock).toHaveBeenCalledTimes(1);
  }

  thenReturnsCreatedCourse(result: unknown) {
    expect(result).toEqual(this.expectedCreatedCourse);
  }

  thenUploadBuiltWithExpectedArgs() {
    expect(this.storageFromMock).toHaveBeenCalledWith('courses-pdf');
    expect(this.uploadMock).toHaveBeenCalledWith(
      this.storagePath,
      this.fileUpload.buffer,
      {
        contentType: this.fileUpload.mimeType,
        upsert: false,
      },
    );
  }

  thenInsertCourseFileBuilt() {
    expect(this.courseFilesInsertMock).toHaveBeenCalledWith({
      course_id: this.courseId,
      file_url: this.storagePath,
      file_name: this.fileUpload.originalFileName,
    });
  }

  thenReturnsInsertedCourseFile(result: unknown) {
    expect(result).toEqual(this.expectedCourseFile);
  }

  thenRemoveCalledAfterInsertFailure() {
    expect(this.removeMock).toHaveBeenCalledWith([this.storagePath]);
  }
}
