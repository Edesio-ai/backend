import { CourseServerError } from 'src/domain/teaching/error';
import { CourseSupabaseRepository } from './course-supabase.repository';

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
});

class Fixtures {
  public readonly sessionId = 'session-1';
  public readonly courseIds = ['course-1', 'course-2'];
  public readonly coursesData = [{ id: 'course-1' }, { id: 'course-2' }];

  private readonly coursesListEqMock = jest.fn();
  private readonly coursesSelectMock = jest.fn(() => ({
    eq: this.coursesListEqMock,
  }));

  private readonly coursesDeleteEqMock = jest.fn();
  private readonly coursesDeleteMock = jest.fn(() => ({
    eq: this.coursesDeleteEqMock,
  }));

  private readonly courseFilesEqMock = jest.fn();
  private readonly courseFilesSelectMock = jest.fn(() => ({
    eq: this.courseFilesEqMock,
  }));

  public readonly removeMock = jest.fn();
  private readonly storageFromMock = jest.fn(() => ({
    remove: this.removeMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'courses') {
      return {
        select: this.coursesSelectMock,
        delete: this.coursesDeleteMock,
      };
    }
    if (table === 'course_files') {
      return { select: this.courseFilesSelectMock };
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
}
