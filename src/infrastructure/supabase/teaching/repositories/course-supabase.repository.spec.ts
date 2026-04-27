import { CourseServerError } from 'src/domain/teaching/error';
import { CourseSupabaseRepository } from './course-supabase.repository';
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

  it('should return course by id', async () => {
    fixtures.whenGetCourseByIdSucceeds();

    const result = await fixtures.whenGetCourseById();

    fixtures.thenGetCourseByIdQueryBuilt();
    expect(result).toEqual(fixtures.expectedCourseById);
  });

  it('should throw CourseServerError when getCourseById fails', async () => {
    fixtures.whenGetCourseByIdFails();

    const promise = fixtures.whenGetCourseById();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should return validated questions flag', async () => {
    fixtures.whenGetCourseValidatedQuestionsSucceeds();

    const result = await fixtures.whenGetCourseValidatedQuestions();

    fixtures.thenGetCourseValidatedQuestionsQueryBuilt();
    expect(result).toEqual({ validatedQuestions: true });
  });

  it('should throw CourseServerError when getCourseValidatedQuestions fails', async () => {
    fixtures.whenGetCourseValidatedQuestionsFails();

    const promise = fixtures.whenGetCourseValidatedQuestions();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should return session courses mapped and ordered', async () => {
    fixtures.whenGetSessionCoursesBySessionIdSucceeds();

    const result = await fixtures.whenGetSessionCoursesBySessionId();

    fixtures.thenGetSessionCoursesBySessionIdQueryBuilt();
    expect(result).toEqual(fixtures.expectedSessionCourses);
  });

  it('should return empty array when getSessionCoursesBySessionId data is null', async () => {
    fixtures.whenGetSessionCoursesBySessionIdReturnsNullData();

    const result = await fixtures.whenGetSessionCoursesBySessionId();

    expect(result).toEqual([]);
  });

  it('should throw CourseServerError when getSessionCoursesBySessionId fails', async () => {
    fixtures.whenGetSessionCoursesBySessionIdFails();

    const promise = fixtures.whenGetSessionCoursesBySessionId();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should return course files by course id', async () => {
    fixtures.whenGetCourseFilesSucceeds();

    const result = await fixtures.whenGetCourseFilesByCourseId();

    fixtures.thenGetCourseFilesQueryBuilt();
    expect(result).toEqual([fixtures.expectedCourseFile]);
  });

  it('should throw CourseServerError when getCourseFilesByCourseId fails', async () => {
    fixtures.whenGetCourseFilesFails();

    const promise = fixtures.whenGetCourseFilesByCourseId();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should return course with session by id', async () => {
    fixtures.whenGetCourseWithSessionByIdSucceeds();

    const result = await fixtures.whenGetCourseWithSessionById();

    fixtures.thenGetCourseWithSessionByIdQueryBuilt();
    expect(result).toEqual(fixtures.expectedCourseWithSession);
  });

  it('should throw CourseServerError when getCourseWithSessionById fails', async () => {
    fixtures.whenGetCourseWithSessionByIdFails();

    const promise = fixtures.whenGetCourseWithSessionById();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should delete course by id', async () => {
    fixtures.whenDeleteCourseByIdSucceeds();

    await fixtures.whenDeleteCourseById();

    fixtures.thenDeleteCourseByIdQueryBuilt();
  });

  it('should throw CourseServerError when deleteCourseById fails', async () => {
    fixtures.whenDeleteCourseByIdFails();

    const promise = fixtures.whenDeleteCourseById();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should update course and return mapped domain object', async () => {
    fixtures.whenUpdateCourseSucceeds();

    const result = await fixtures.whenUpdateCourse();

    fixtures.thenUpdateCourseQueryBuilt();
    expect(result).toEqual(fixtures.expectedUpdatedCourse);
  });

  it('should throw CourseServerError when updateCourse fails', async () => {
    fixtures.whenUpdateCourseFails();

    const promise = fixtures.whenUpdateCourse();

    await fixtures.thenThrowCourseServerError(promise);
  });

  it('should return buffer from storage', async () => {
    fixtures.whenGetFileBufferSucceeds();

    const result = await fixtures.whenGetFileBufferFromStorage();

    expect(result).toBeInstanceOf(Buffer);
    fixtures.thenDownloadCalledWithPath();
  });

  it('should throw CourseServerError when getFileBufferFromStorage fails', async () => {
    fixtures.whenGetFileBufferFails();

    const promise = fixtures.whenGetFileBufferFromStorage();

    await fixtures.thenThrowCourseServerError(promise);
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
    createdAt: '2026-01-01T00:00:00.000Z',
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

  public readonly courseDetailId = 'course-detail-1';
  public readonly courseByIdSupabaseRow = {
    id: this.courseDetailId,
    session_id: 'session-99',
    title: 'Titre cours',
    description: null,
    text_content: null,
    created_at: '2026-01-01T00:00:00.000Z',
  };
  public readonly expectedCourseById = {
    id: this.courseDetailId,
    sessionId: 'session-99',
    title: 'Titre cours',
    description: null,
    contentText: null,
    validatedQuestions: undefined,
    positionOrder: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  public readonly sessionCoursesSupabaseRows = [
    {
      id: 'c-a',
      session_id: this.sessionId,
      title: 'A',
      description: null,
      text_content: null,
      created_at: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'c-b',
      session_id: this.sessionId,
      title: 'B',
      description: null,
      text_content: null,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];
  public readonly expectedSessionCourses = [
    {
      id: 'c-a',
      sessionId: this.sessionId,
      title: 'A',
      description: null,
      contentText: null,
      validatedQuestions: undefined,
      positionOrder: undefined,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'c-b',
      sessionId: this.sessionId,
      title: 'B',
      description: null,
      contentText: null,
      validatedQuestions: undefined,
      positionOrder: undefined,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  private readonly coursesListEqMock = jest.fn();
  private readonly coursesCountEqMock = jest.fn();

  private readonly coursesByIdSingleMock = jest.fn();
  private readonly coursesByIdEqMock = jest.fn(() => ({
    single: this.coursesByIdSingleMock,
  }));

  private readonly coursesSessionOrderMock = jest.fn();
  private readonly coursesSessionCoursesEqMock = jest.fn(() => ({
    order: this.coursesSessionOrderMock,
  }));

  private readonly coursesSelectMock = jest.fn(
    (first: string, second?: object) => {
      if (second && typeof second === 'object' && 'count' in second) {
        return { eq: this.coursesCountEqMock };
      }
      if (first === 'id') {
        return { eq: this.coursesListEqMock };
      }
      if (first === 'id, session_id' || first === 'validated_questions') {
        return { eq: this.coursesByIdEqMock };
      }
      if (first === '*') {
        return { eq: this.coursesSessionCoursesEqMock };
      }
      return { eq: this.courseWithSessionEqMock };
    },
  );

  private readonly coursesDeleteEqMock = jest.fn();
  private readonly coursesDeleteMock = jest.fn(() => ({
    eq: this.coursesDeleteEqMock,
  }));

  private readonly coursesByIdDeleteEqMock = jest.fn();
  private readonly coursesByIdDeleteMock = jest.fn(() => ({
    eq: this.coursesByIdDeleteEqMock,
  }));

  private readonly coursesUpdateSingleMock = jest.fn();
  private readonly coursesUpdateSelectMock = jest.fn(() => ({
    single: this.coursesUpdateSingleMock,
  }));
  private readonly coursesUpdateEqMock = jest.fn(() => ({
    select: this.coursesUpdateSelectMock,
  }));
  private readonly coursesUpdateMock = jest.fn(() => ({
    eq: this.coursesUpdateEqMock,
  }));

  private readonly courseWithSessionSingleMock = jest.fn();
  private readonly courseWithSessionEqMock = jest.fn(() => ({
    single: this.courseWithSessionSingleMock,
  }));
  private readonly courseWithSessionSelectMock = jest.fn(() => ({
    eq: this.courseWithSessionEqMock,
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

  private readonly courseFilesDeleteEqMock = jest.fn();
  private readonly courseFilesDeleteMock = jest.fn(() => ({
    eq: this.courseFilesDeleteEqMock,
  }));

  public readonly removeMock = jest.fn();
  public readonly uploadMock = jest.fn();
  public readonly downloadMock = jest.fn();
  private readonly storageFromMock = jest.fn(() => ({
    remove: this.removeMock,
    upload: this.uploadMock,
    download: this.downloadMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'courses') {
      return {
        select: this.coursesSelectMock,
        delete: this.coursesDeleteMock,
        insert: this.coursesInsertMock,
        update: this.coursesUpdateMock,
      };
    }
    if (table === 'course_files') {
      return {
        select: this.courseFilesSelectMock,
        insert: this.courseFilesInsertMock,
        delete: this.courseFilesDeleteMock,
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

  whenGetCourseById() {
    return this.repository.getCourseById(this.courseDetailId);
  }

  whenGetCourseValidatedQuestions() {
    return this.repository.getCourseValidatedQuestions(this.courseDetailId);
  }

  whenGetSessionCoursesBySessionId() {
    return this.repository.getSessionCoursesBySessionId(this.sessionId);
  }

  whenGetCourseFilesByCourseId() {
    return this.repository.getCourseFilesByCourseId(this.courseId);
  }

  whenGetCourseByIdSucceeds() {
    this.coursesByIdSingleMock.mockResolvedValue({
      data: this.courseByIdSupabaseRow,
      error: null,
    });
  }

  whenGetCourseByIdFails() {
    this.coursesByIdSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'course by id failed' },
    });
  }

  whenGetCourseValidatedQuestionsSucceeds() {
    this.coursesByIdSingleMock.mockResolvedValue({
      data: { validated_questions: true },
      error: null,
    });
  }

  whenGetCourseValidatedQuestionsFails() {
    this.coursesByIdSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'validated questions failed' },
    });
  }

  whenGetSessionCoursesBySessionIdSucceeds() {
    this.coursesSessionOrderMock.mockResolvedValue({
      data: this.sessionCoursesSupabaseRows,
      error: null,
    });
  }

  whenGetSessionCoursesBySessionIdReturnsNullData() {
    this.coursesSessionOrderMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenGetSessionCoursesBySessionIdFails() {
    this.coursesSessionOrderMock.mockResolvedValue({
      data: null,
      error: { message: 'session courses failed' },
    });
  }

  whenGetCourseFilesSucceeds() {
    this.courseFilesEqMock.mockResolvedValue({
      data: [this.insertedCourseFileSupabaseRow],
      error: null,
    });
  }

  whenGetCourseFilesFails() {
    this.courseFilesEqMock.mockResolvedValue({
      data: null,
      error: { message: 'course files failed' },
    });
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
    this.courseFilesDeleteEqMock.mockResolvedValue({ error: null });
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

  thenGetCourseByIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesSelectMock).toHaveBeenCalledWith('id, session_id');
    expect(this.coursesByIdEqMock).toHaveBeenCalledWith(
      'id',
      this.courseDetailId,
    );
  }

  thenGetCourseValidatedQuestionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesSelectMock).toHaveBeenCalledWith('validated_questions');
    expect(this.coursesByIdEqMock).toHaveBeenCalledWith(
      'id',
      this.courseDetailId,
    );
  }

  thenGetSessionCoursesBySessionIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesSelectMock).toHaveBeenCalledWith('*');
    expect(this.coursesSessionCoursesEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionId,
    );
    expect(this.coursesSessionOrderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  }

  thenGetCourseFilesQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('course_files');
    expect(this.courseFilesSelectMock).toHaveBeenCalledWith('*');
    expect(this.courseFilesEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseId,
    );
  }

  // --- getCourseWithSessionById ---

  public readonly courseWithSessionSupabaseRow = {
    id: this.courseDetailId,
    title: 'Titre cours',
    description: null,
    content_text: null,
    validated_questions: false,
    position_order: undefined,
    session: { teacher_id: 'teacher-1', language: 'francais' },
  };

  public readonly expectedCourseWithSession = {
    id: this.courseDetailId,
    title: 'Titre cours',
    description: null,
    contentText: null,
    validatedQuestions: false,
    positionOrder: undefined,
    session: {
      id: '',
      teacherId: 'teacher-1',
      name: '',
      code: '',
      language: 'francais',
      createdAt: '',
    },
  };

  whenGetCourseWithSessionById() {
    return this.repository.getCourseWithSessionById(
      this.courseDetailId,
      'id, title',
    );
  }

  whenGetCourseWithSessionByIdSucceeds() {
    this.courseWithSessionSingleMock.mockResolvedValue({
      data: this.courseWithSessionSupabaseRow,
      error: null,
    });
  }

  whenGetCourseWithSessionByIdFails() {
    this.courseWithSessionSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'course with session failed' },
    });
  }

  thenGetCourseWithSessionByIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesSelectMock).toHaveBeenCalledWith('id, title');
    expect(this.courseWithSessionEqMock).toHaveBeenCalledWith(
      'id',
      this.courseDetailId,
    );
    expect(this.courseWithSessionSingleMock).toHaveBeenCalledTimes(1);
  }

  // --- deleteCourseById ---

  whenDeleteCourseById() {
    return this.repository.deleteCourseById(this.courseDetailId);
  }

  whenDeleteCourseByIdSucceeds() {
    this.coursesByIdDeleteEqMock.mockResolvedValue({ error: null });
    this.coursesDeleteMock.mockReturnValue({
      eq: this.coursesByIdDeleteEqMock,
    });
  }

  whenDeleteCourseByIdFails() {
    this.coursesByIdDeleteEqMock.mockResolvedValue({
      error: { message: 'delete course failed' },
    });
    this.coursesDeleteMock.mockReturnValue({
      eq: this.coursesByIdDeleteEqMock,
    });
  }

  thenDeleteCourseByIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesByIdDeleteEqMock).toHaveBeenCalledWith(
      'id',
      this.courseDetailId,
    );
  }

  // --- updateCourse ---

  public readonly updatePayload = {
    title: 'Titre mis à jour',
    contentText: 'Contenu mis à jour',
  };

  public readonly updatedCourseSupabaseRow = {
    id: this.courseDetailId,
    session_id: 'session-99',
    title: 'Titre mis à jour',
    description: null,
    text_content: 'Contenu mis à jour',
    validated_questions: false,
    position_order: 1,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  public readonly expectedUpdatedCourse = {
    id: this.courseDetailId,
    sessionId: 'session-99',
    title: 'Titre mis à jour',
    description: null,
    contentText: 'Contenu mis à jour',
    validatedQuestions: false,
    positionOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  whenUpdateCourse() {
    return this.repository.updateCourse(
      this.courseDetailId,
      this.updatePayload,
    );
  }

  whenUpdateCourseSucceeds() {
    this.coursesUpdateSingleMock.mockResolvedValue({
      data: this.updatedCourseSupabaseRow,
      error: null,
    });
  }

  whenUpdateCourseFails() {
    this.coursesUpdateSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'update course failed' },
    });
  }

  thenUpdateCourseQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('courses');
    expect(this.coursesUpdateMock).toHaveBeenCalledWith({
      title: 'Titre mis à jour',
      text_content: 'Contenu mis à jour',
    });
    expect(this.coursesUpdateEqMock).toHaveBeenCalledWith(
      'id',
      this.courseDetailId,
    );
    expect(this.coursesUpdateSelectMock).toHaveBeenCalledTimes(1);
    expect(this.coursesUpdateSingleMock).toHaveBeenCalledTimes(1);
  }

  // --- getFileBufferFromStorage ---

  public readonly filePath = 'course-1/doc.pdf';

  whenGetFileBufferFromStorage() {
    return this.repository.getFileBufferFromStorage(this.filePath);
  }

  whenGetFileBufferSucceeds() {
    const arrayBuffer = new ArrayBuffer(8);
    this.downloadMock.mockResolvedValue({
      data: { arrayBuffer: async () => arrayBuffer },
      error: null,
    });
  }

  whenGetFileBufferFails() {
    this.downloadMock.mockResolvedValue({
      data: null,
      error: { message: 'download failed' },
    });
  }

  thenDownloadCalledWithPath() {
    expect(this.storageFromMock).toHaveBeenCalledWith('courses-pdf');
    expect(this.downloadMock).toHaveBeenCalledWith(this.filePath);
  }
}
