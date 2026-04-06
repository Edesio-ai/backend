import { TeacherSupabaseRepository } from './teacher-supabase.repository';
import {
  TeacherNotFoundError,
  TeacherSessionsNotFoundError,
} from '../../../../domain/teaching/error';

describe('TeacherSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return teachers for establishment id', async () => {
    fixtures.whenTeacherQueryReturnsData();

    const result = await fixtures.whenGetTeacherByEstablishmentId();

    fixtures.thenTeacherQueryBuiltWithExpectedArguments();
    fixtures.thenReturnExpectedTeachers(result);
  });

  it('should throw TeacherNotFoundError when teacher query fails', async () => {
    fixtures.whenTeacherQueryReturnsError();

    const promise = fixtures.whenGetTeacherByEstablishmentId();

    await fixtures.thenThrowTeacherNotFound(promise);
  });

  it('should return sessions for teacher ids', async () => {
    fixtures.whenSessionsQueryReturnsData();

    const result = await fixtures.whenGetTeachersSessionsByIds(
      fixtures.teacherIds,
    );

    fixtures.thenSessionsQueryBuiltWithTeacherIds(fixtures.teacherIds);
    fixtures.thenReturnExpectedSessions(result);
  });

  it('should use fallback uuid when teacher ids are empty', async () => {
    fixtures.whenSessionsQueryReturnsData();

    await fixtures.whenGetTeachersSessionsByIds([]);

    fixtures.thenSessionsQueryBuiltWithFallbackId();
  });

  it('should throw TeacherSessionsNotFoundError when sessions query fails', async () => {
    fixtures.whenSessionsQueryReturnsError();

    const promise = fixtures.whenGetTeachersSessionsByIds(fixtures.teacherIds);

    await fixtures.thenThrowTeacherSessionsNotFound(promise);
  });
});

class Fixtures {
  public readonly establishmentId = 'est-1';
  public readonly teacherIds = ['teacher-1', 'teacher-2'];
  public readonly fallbackId = '00000000-0000-0000-0000-000000000000';
  public readonly teachers = [{ id: 'teacher-1', name: 'Prof 1' }];
  public readonly sessions = [{ id: 'session-1', teacher_id: 'teacher-1' }];

  private readonly teacherEqMock = jest.fn();
  private readonly teacherSelectMock = jest.fn(() => ({
    eq: this.teacherEqMock,
  }));
  private readonly teacherFromMock = jest.fn(() => ({
    select: this.teacherSelectMock,
  }));

  private readonly sessionsInMock = jest.fn();
  private readonly sessionsSelectMock = jest.fn(() => ({
    in: this.sessionsInMock,
  }));
  private readonly sessionsFromMock = jest.fn(() => ({
    select: this.sessionsSelectMock,
  }));

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'teachers') return this.teacherFromMock();
    if (table === 'sessions') return this.sessionsFromMock();
    return {};
  });

  public readonly repository: TeacherSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new TeacherSupabaseRepository(supabaseMock as any);
  }

  whenGetTeacherByEstablishmentId() {
    return this.repository.getTeacherByEstablishmentId(this.establishmentId);
  }

  whenGetTeachersSessionsByIds(ids: string[]) {
    return this.repository.getTeachersSessionsByIds(ids);
  }

  whenTeacherQueryReturnsData() {
    this.teacherEqMock.mockResolvedValue({
      data: this.teachers,
      error: null,
    });
  }

  whenTeacherQueryReturnsError() {
    this.teacherEqMock.mockResolvedValue({
      data: null,
      error: { message: 'teacher query failed' },
    });
  }

  whenSessionsQueryReturnsData() {
    this.sessionsInMock.mockResolvedValue({
      data: this.sessions,
      error: null,
    });
  }

  whenSessionsQueryReturnsError() {
    this.sessionsInMock.mockResolvedValue({
      data: null,
      error: { message: 'sessions query failed' },
    });
  }

  async thenThrowTeacherNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(TeacherNotFoundError);
  }

  async thenThrowTeacherSessionsNotFound(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(TeacherSessionsNotFoundError);
  }

  thenTeacherQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('teachers');
    expect(this.teacherSelectMock).toHaveBeenCalledWith(
      'id, name, email, created_at',
    );
    expect(this.teacherEqMock).toHaveBeenCalledWith(
      'establishment_id',
      this.establishmentId,
    );
  }

  thenSessionsQueryBuiltWithTeacherIds(ids: string[]) {
    expect(this.fromMock).toHaveBeenCalledWith('sessions');
    expect(this.sessionsSelectMock).toHaveBeenCalledWith(
      'id, name, code, language, teacher_id, created_at',
    );
    expect(this.sessionsInMock).toHaveBeenCalledWith('teacher_id', ids);
  }

  thenSessionsQueryBuiltWithFallbackId() {
    expect(this.sessionsInMock).toHaveBeenCalledWith('teacher_id', [
      this.fallbackId,
    ]);
  }

  thenReturnExpectedTeachers(result: any) {
    expect(result).toEqual(this.teachers);
  }

  thenReturnExpectedSessions(result: any) {
    expect(result).toEqual(this.sessions);
  }
}
