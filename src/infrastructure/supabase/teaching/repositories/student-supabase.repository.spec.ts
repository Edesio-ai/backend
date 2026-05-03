import { StudentSupabaseRepository } from './student-supabase.repository';
import { ServerError } from '../../../../domain/shared/global/errors/global.errors';
import { AuthUser } from '../../../../domain/auth/types/auth.type';

describe('StudentSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  // ─── getStudentsSessionsByIds ────────────────────────────────────────────────

  it('should return student sessions for session ids', async () => {
    fixtures.whenQueryReturnsData();

    const result = await fixtures.whenGetStudentsSessionsByIds(
      fixtures.sessionIds,
    );

    fixtures.thenQueryBuiltWithSessionIds(fixtures.sessionIds);
    fixtures.thenReturnExpectedStudentSessions(result);
  });

  it('should use fallback uuid when session ids are empty', async () => {
    fixtures.whenQueryReturnsData();

    await fixtures.whenGetStudentsSessionsByIds([]);

    fixtures.thenQueryBuiltWithFallbackId();
  });

  it('should throw ServerError when getStudentsSessionsByIds query fails', async () => {
    fixtures.whenQueryReturnsError();

    await expect(
      fixtures.whenGetStudentsSessionsByIds(fixtures.sessionIds),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── deleteStudentSessionsBySessionId ───────────────────────────────────────

  it('should delete student_sessions by session id', async () => {
    fixtures.whenDeleteStudentSessionsSucceeds();

    await fixtures.whenDeleteStudentSessionsBySessionId();

    fixtures.thenDeleteStudentSessionsQueryBuilt();
  });

  it('should throw ServerError when delete student_sessions fails', async () => {
    fixtures.whenDeleteStudentSessionsFails();

    await expect(
      fixtures.whenDeleteStudentSessionsBySessionId(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── getStudentStatsByCourseId ───────────────────────────────────────────────

  it('should return student course stats mapped for course id', async () => {
    fixtures.whenStudentStatsQueryReturnsData();

    const result = await fixtures.whenGetStudentStatsByCourseId();

    fixtures.thenStudentStatsQueryBuilt();
    expect(result).toEqual(fixtures.expectedStudentCourseStats);
  });

  it('should throw ServerError when getStudentStatsByCourseId fails', async () => {
    fixtures.whenStudentStatsQueryFails();

    await expect(
      fixtures.whenGetStudentStatsByCourseId(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── deleteStudentCourseStatsByCourseId ─────────────────────────────────────

  it('should delete student course stats by course id', async () => {
    fixtures.whenDeleteStudentCourseStatsByIdSucceeds();

    await fixtures.whenDeleteStudentCourseStatsByCourseId();

    fixtures.thenDeleteStudentCourseStatsQueryBuilt();
  });

  it('should throw ServerError when deleteStudentCourseStatsByCourseId fails', async () => {
    fixtures.whenDeleteStudentCourseStatsByIdFails();

    await expect(
      fixtures.whenDeleteStudentCourseStatsByCourseId(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── getStudentByUserId ──────────────────────────────────────────────────────

  it('should return a mapped student when found by user id', async () => {
    fixtures.whenGetStudentByUserIdReturnsData();

    const result = await fixtures.whenGetStudentByUserId();

    expect(result).toEqual(fixtures.expectedStudent);
    fixtures.thenGetStudentByUserIdQueryBuilt();
  });

  it('should return null when student is not found by user id', async () => {
    fixtures.whenGetStudentByUserIdReturnsNull();

    const result = await fixtures.whenGetStudentByUserId();

    expect(result).toBeNull();
  });

  it('should throw ServerError when getStudentByUserId query fails', async () => {
    fixtures.whenGetStudentByUserIdFails();

    await expect(fixtures.whenGetStudentByUserId()).rejects.toBeInstanceOf(
      ServerError,
    );
  });

  // ─── getStudentJoinedSessions ────────────────────────────────────────────────

  it('should return mapped joined sessions for a student', async () => {
    fixtures.whenJoinedSessionsQueryReturnsData();

    const result = await fixtures.whenGetStudentJoinedSessions();

    fixtures.thenJoinedSessionsQueryBuilt();
    expect(result).toEqual(fixtures.expectedJoinedSessions);
  });

  it('should return empty array when no joined sessions exist', async () => {
    fixtures.whenJoinedSessionsQueryReturnsEmpty();

    const result = await fixtures.whenGetStudentJoinedSessions();

    expect(result).toEqual([]);
  });

  it('should throw ServerError when getStudentJoinedSessions query fails', async () => {
    fixtures.whenJoinedSessionsQueryFails();

    await expect(
      fixtures.whenGetStudentJoinedSessions(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── createStudentSession ────────────────────────────────────────────────────

  it('should insert a student session row', async () => {
    fixtures.whenCreateStudentSessionSucceeds();

    await fixtures.whenCreateStudentSession();

    fixtures.thenCreateStudentSessionQueryBuilt();
  });

  it('should throw ServerError when createStudentSession fails', async () => {
    fixtures.whenCreateStudentSessionFails();

    await expect(fixtures.whenCreateStudentSession()).rejects.toBeInstanceOf(
      ServerError,
    );
  });

  // ─── createStudent ───────────────────────────────────────────────────────────

  it('should create and return a mapped student', async () => {
    fixtures.whenCreateStudentSucceeds();

    const result = await fixtures.whenCreateStudent(fixtures.authUser);

    expect(result).toEqual(fixtures.expectedStudent);
    fixtures.thenCreateStudentQueryBuilt();
  });

  it('should build the student name from firstname and lastname', async () => {
    fixtures.whenCreateStudentSucceeds();

    await fixtures.whenCreateStudent(fixtures.authUser);

    expect(fixtures.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice Dupont' }),
    );
  });

  it('should use only firstname when lastname is missing', async () => {
    fixtures.whenCreateStudentSucceeds();

    await fixtures.whenCreateStudent({
      ...fixtures.authUser,
      metadata: { firstname: 'Alice' },
    });

    expect(fixtures.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice' }),
    );
  });

  it('should use "Élève" as fallback name when no names are provided', async () => {
    fixtures.whenCreateStudentSucceeds();

    await fixtures.whenCreateStudent({
      ...fixtures.authUser,
      metadata: {},
    });

    expect(fixtures.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Élève' }),
    );
  });

  it('should throw ServerError when createStudent query fails', async () => {
    fixtures.whenCreateStudentFails();

    await expect(
      fixtures.whenCreateStudent(fixtures.authUser),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── getStudentsByIds ────────────────────────────────────────────────────────

  it('should return mapped students for given ids', async () => {
    fixtures.whenStudentsByIdsQueryReturnsData();

    const result = await fixtures.whenGetStudentsByIds();

    fixtures.thenStudentsByIdsQueryBuilt();
    expect(result).toEqual(fixtures.expectedStudentsBatch);
  });

  it('should return an empty array when no students match the ids', async () => {
    fixtures.whenStudentsByIdsQueryReturnsEmpty();

    const result = await fixtures.whenGetStudentsByIds();

    expect(result).toEqual([]);
  });

  it('should throw ServerError when getStudentsByIds query fails', async () => {
    fixtures.whenStudentsByIdsQueryFails();

    await expect(fixtures.whenGetStudentsByIds()).rejects.toBeInstanceOf(
      ServerError,
    );
  });

  // ─── getStudentsSessionsById ─────────────────────────────────────────────────

  it('should return mapped session students for a session id', async () => {
    fixtures.whenSessionStudentsQueryReturnsData();

    const result = await fixtures.whenGetStudentsSessionsById();

    fixtures.thenSessionStudentsQueryBuilt();
    expect(result).toEqual(fixtures.expectedSessionStudents);
  });

  it('should return an empty array when no students are in the session', async () => {
    fixtures.whenSessionStudentsQueryReturnsEmpty();

    const result = await fixtures.whenGetStudentsSessionsById();

    expect(result).toEqual([]);
  });

  it('should throw ServerError when getStudentsSessionsById query fails', async () => {
    fixtures.whenSessionStudentsQueryFails();

    await expect(fixtures.whenGetStudentsSessionsById()).rejects.toBeInstanceOf(
      ServerError,
    );
  });
});

class Fixtures {
  public readonly sessionIds = ['session-1', 'session-2'];
  public readonly sessionIdToDelete = 'session-1';
  public readonly fallbackId = '00000000-0000-0000-0000-000000000000';
  public readonly userId = 'user-1';

  public readonly authUser: AuthUser = {
    id: this.userId,
    email: 'alice@school.com',
    emailConfirmedAt: '2026-01-01T00:00:00.000Z',
    metadata: { firstname: 'Alice', lastname: 'Dupont', role: 'student' },
  };

  public readonly studentSupabaseRow = {
    id: 'student-1',
    supabase_user_id: this.userId,
    name: 'Alice Dupont',
    email: 'alice@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    photo_url: 'https://x/a.png',
  };

  public readonly expectedStudent = {
    id: 'student-1',
    supabaseUserId: this.userId,
    name: 'Alice Dupont',
    email: 'alice@school.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    photoUrl: 'https://x/a.png',
  };

  public readonly studentSessionsSupabaseRows = [
    { session_id: 'session-1', student_id: 'student-1' },
  ];
  public readonly expectedStudentSessions = [
    { sessionId: 'session-1', studentId: 'student-1' },
  ];

  public readonly studentIdForJoinedSessions = 'student-1';
  public readonly joinedSessionsSupabaseRows = [
    {
      joined_at: '2026-01-15T10:00:00.000Z',
      sessions: {
        id: 'session-1',
        teacher_id: 'teacher-1',
        name: 'Session de maths',
        code: 'ABC123',
        language: 'francais',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    },
  ];
  public readonly expectedJoinedSessions = [
    {
      id: 'session-1',
      teacherId: 'teacher-1',
      name: 'Session de maths',
      code: 'ABC123',
      language: 'francais',
      createdAt: '2026-01-01T00:00:00.000Z',
      joinedAt: '2026-01-15T10:00:00.000Z',
    },
  ];

  public readonly sessionIdForStudents = 'session-1';
  public readonly sessionStudentsSelect = `
            joined_at,
            students (id, name, email, photo_url)
        `;
  public readonly sessionStudentsSupabaseRows = [
    {
      joined_at: '2026-01-15T10:00:00.000Z',
      students: {
        id: 'student-1',
        name: 'Alice',
        email: 'alice@school.com',
        photo_url: 'https://x/a.png',
      },
    },
  ];
  public readonly expectedSessionStudents = [
    {
      id: 'student-1',
      name: 'Alice',
      email: 'alice@school.com',
      photoUrl: 'https://x/a.png',
      joinedAt: '2026-01-15T10:00:00.000Z',
    },
  ];

  public readonly studentBatchIds = ['student-1', 'student-2'];
  public readonly studentsBatchSupabaseRows = [
    {
      id: 'student-1',
      supabase_user_id: 'user-1',
      name: 'Alice Dupont',
      email: 'alice@school.com',
      created_at: '2026-01-01T00:00:00.000Z',
      photo_url: 'https://x/a.png',
    },
    {
      id: 'student-2',
      supabase_user_id: 'user-2',
      name: 'Bob Martin',
      email: 'bob@school.com',
      created_at: '2026-01-02T00:00:00.000Z',
      photo_url: '',
    },
  ];
  public readonly expectedStudentsBatch = [
    {
      id: 'student-1',
      supabaseUserId: 'user-1',
      name: 'Alice Dupont',
      email: 'alice@school.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      photoUrl: 'https://x/a.png',
    },
    {
      id: 'student-2',
      supabaseUserId: 'user-2',
      name: 'Bob Martin',
      email: 'bob@school.com',
      createdAt: '2026-01-02T00:00:00.000Z',
      photoUrl: '',
    },
  ];

  public readonly courseIdForStats = 'course-stats-1';
  public readonly studentStatsSupabaseRows = [
    {
      student_id: 'stu-1',
      attempted_questions: 10,
      correct_answers: 8,
      last_attempt_at: '2026-01-01T12:00:00.000Z',
      students: {
        id: 'stu-1',
        name: 'Alice',
        email: 'alice@school.com',
        photo_url: 'https://x/a.png',
      },
    },
  ];
  public readonly expectedStudentCourseStats = [
    {
      studentId: 'stu-1',
      attemptedQuestions: 10,
      correctAnswers: 8,
      lastAttemptAt: '2026-01-01T12:00:00.000Z',
      student: {
        id: 'stu-1',
        name: 'Alice',
        email: 'alice@school.com',
        photoUrl: 'https://x/a.png',
      },
    },
  ];

  // ─── Supabase chain mocks ────────────────────────────────────────────────────

  private readonly inMock = jest.fn();
  private readonly selectMock = jest.fn(() => ({ in: this.inMock }));

  // getStudentsSessionsById chain: .select(select).eq(...)
  private readonly sessionStudentsEqMock = jest.fn();
  private readonly sessionStudentsSelectMock = jest.fn(() => ({
    eq: this.sessionStudentsEqMock,
  }));

  // getStudentJoinedSessions chain: .select(...).eq(...).order(...)
  private readonly joinedSessionsOrderMock = jest.fn();
  private readonly joinedSessionsEqMock = jest.fn(() => ({
    order: this.joinedSessionsOrderMock,
  }));
  private readonly joinedSessionsSelectMock = jest.fn(() => ({
    eq: this.joinedSessionsEqMock,
  }));

  private readonly statsEqMock = jest.fn();
  private readonly statsSelectMock = jest.fn(() => ({ eq: this.statsEqMock }));

  private readonly statsDeleteEqMock = jest.fn();
  private readonly statsDeleteMock = jest.fn(() => ({
    eq: this.statsDeleteEqMock,
  }));

  private readonly deleteEqMock = jest.fn();
  private readonly deleteMock = jest.fn(() => ({ eq: this.deleteEqMock }));

  // getStudentByUserId chain: .select('*').eq(...).maybeSingle()
  private readonly maybeSingleMock = jest.fn();
  private readonly studentByUserIdEqMock = jest.fn(() => ({
    maybeSingle: this.maybeSingleMock,
  }));
  private readonly studentByUserIdSelectMock = jest.fn(() => ({
    eq: this.studentByUserIdEqMock,
  }));

  // createStudent chain: .insert(...).select().single()
  public readonly insertSelectSingleMock = jest.fn();
  private readonly insertSelectMock = jest.fn(() => ({
    single: this.insertSelectSingleMock,
  }));
  public readonly insertMock = jest.fn(() => ({
    select: this.insertSelectMock,
  }));

  // createStudentSession chain: .insert(...)
  public readonly createStudentSessionInsertMock = jest.fn();

  // getStudentsByIds chain: .select('*').in('id', ids)
  private readonly studentsByIdsInMock = jest.fn();
  private readonly studentsByIdsSelectMock = jest.fn(() => ({
    in: this.studentsByIdsInMock,
  }));

  private mode:
    | 'select'
    | 'delete'
    | 'stats'
    | 'stats-delete'
    | 'student-by-user-id'
    | 'create-student'
    | 'joined-sessions'
    | 'create-student-session'
    | 'session-students'
    | 'get-students-by-ids' = 'select';

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'student_course_stats') {
      if (this.mode === 'stats-delete') {
        return { delete: this.statsDeleteMock };
      }
      return { select: this.statsSelectMock };
    }
    if (table === 'students') {
      if (this.mode === 'create-student') {
        return { insert: this.insertMock };
      }
      if (this.mode === 'get-students-by-ids') {
        return { select: this.studentsByIdsSelectMock };
      }
      return { select: this.studentByUserIdSelectMock };
    }
    if (this.mode === 'delete') {
      return { delete: this.deleteMock };
    }
    if (this.mode === 'joined-sessions') {
      return { select: this.joinedSessionsSelectMock };
    }
    if (this.mode === 'create-student-session') {
      return { insert: this.createStudentSessionInsertMock };
    }
    if (this.mode === 'session-students') {
      return { select: this.sessionStudentsSelectMock };
    }
    return { select: this.selectMock };
  });

  public readonly repository: StudentSupabaseRepository;

  constructor() {
    this.repository = new StudentSupabaseRepository({
      from: this.fromMock,
    } as any);
  }

  // ─── When helpers ────────────────────────────────────────────────────────────

  whenGetStudentsSessionsByIds(sessionIds: string[]) {
    this.mode = 'select';
    return this.repository.getStudentsSessionsByIds(sessionIds);
  }

  whenDeleteStudentSessionsBySessionId() {
    this.mode = 'delete';
    return this.repository.deleteStudentSessionsBySessionId(
      this.sessionIdToDelete,
    );
  }

  whenGetStudentJoinedSessions() {
    this.mode = 'joined-sessions';
    return this.repository.getStudentJoinedSessions(
      this.studentIdForJoinedSessions,
    );
  }

  whenCreateStudentSession() {
    this.mode = 'create-student-session';
    return this.repository.createStudentSession('student-1', 'session-1');
  }

  whenGetStudentStatsByCourseId() {
    this.mode = 'stats';
    return this.repository.getStudentStatsByCourseId(this.courseIdForStats);
  }

  whenDeleteStudentCourseStatsByCourseId() {
    this.mode = 'stats-delete';
    return this.repository.deleteStudentCourseStatsByCourseId(
      this.courseIdForStats,
    );
  }

  whenGetStudentByUserId() {
    this.mode = 'student-by-user-id';
    return this.repository.getStudentByUserId(this.userId);
  }

  whenCreateStudent(user: AuthUser) {
    this.mode = 'create-student';
    return this.repository.createStudent(user);
  }

  whenGetStudentsByIds() {
    this.mode = 'get-students-by-ids';
    return this.repository.getStudentsByIds(this.studentBatchIds);
  }

  whenGetStudentsSessionsById() {
    this.mode = 'session-students';
    return this.repository.getStudentsSessionsById(
      this.sessionIdForStudents,
      this.sessionStudentsSelect,
    );
  }

  // ─── Setup helpers ───────────────────────────────────────────────────────────

  whenQueryReturnsData() {
    this.inMock.mockResolvedValue({
      data: this.studentSessionsSupabaseRows,
      error: null,
    });
  }

  whenQueryReturnsError() {
    this.inMock.mockResolvedValue({
      data: null,
      error: { message: 'query failed' },
    });
  }

  whenDeleteStudentSessionsSucceeds() {
    this.deleteEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteStudentSessionsFails() {
    this.deleteEqMock.mockResolvedValue({
      error: { message: 'delete failed' },
    });
  }

  whenCreateStudentSessionSucceeds() {
    this.createStudentSessionInsertMock.mockResolvedValue({ error: null });
  }

  whenCreateStudentSessionFails() {
    this.createStudentSessionInsertMock.mockResolvedValue({
      error: { message: 'insert student session failed' },
    });
  }

  whenJoinedSessionsQueryReturnsData() {
    this.joinedSessionsOrderMock.mockResolvedValue({
      data: this.joinedSessionsSupabaseRows,
      error: null,
    });
  }

  whenJoinedSessionsQueryReturnsEmpty() {
    this.joinedSessionsOrderMock.mockResolvedValue({
      data: [],
      error: null,
    });
  }

  whenJoinedSessionsQueryFails() {
    this.joinedSessionsOrderMock.mockResolvedValue({
      data: null,
      error: { message: 'joined sessions query failed' },
    });
  }

  whenStudentStatsQueryReturnsData() {
    this.statsEqMock.mockResolvedValue({
      data: this.studentStatsSupabaseRows,
      error: null,
    });
  }

  whenStudentStatsQueryFails() {
    this.statsEqMock.mockResolvedValue({
      data: null,
      error: { message: 'stats query failed' },
    });
  }

  whenDeleteStudentCourseStatsByIdSucceeds() {
    this.statsDeleteEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteStudentCourseStatsByIdFails() {
    this.statsDeleteEqMock.mockResolvedValue({
      error: { message: 'delete stats failed' },
    });
  }

  whenGetStudentByUserIdReturnsData() {
    this.maybeSingleMock.mockResolvedValue({
      data: this.studentSupabaseRow,
      error: null,
    });
  }

  whenGetStudentByUserIdReturnsNull() {
    this.maybeSingleMock.mockResolvedValue({ data: null, error: null });
  }

  whenGetStudentByUserIdFails() {
    this.maybeSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'student not found error' },
    });
  }

  whenCreateStudentSucceeds() {
    this.insertSelectSingleMock.mockResolvedValue({
      data: this.studentSupabaseRow,
      error: null,
    });
  }

  whenCreateStudentFails() {
    this.insertSelectSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });
  }

  whenStudentsByIdsQueryReturnsData() {
    this.studentsByIdsInMock.mockResolvedValue({
      data: this.studentsBatchSupabaseRows,
      error: null,
    });
  }

  whenStudentsByIdsQueryReturnsEmpty() {
    this.studentsByIdsInMock.mockResolvedValue({ data: [], error: null });
  }

  whenStudentsByIdsQueryFails() {
    this.studentsByIdsInMock.mockResolvedValue({
      data: null,
      error: { message: 'students by ids query failed' },
    });
  }

  whenSessionStudentsQueryReturnsData() {
    this.sessionStudentsEqMock.mockResolvedValue({
      data: this.sessionStudentsSupabaseRows,
      error: null,
    });
  }

  whenSessionStudentsQueryReturnsEmpty() {
    this.sessionStudentsEqMock.mockResolvedValue({
      data: [],
      error: null,
    });
  }

  whenSessionStudentsQueryFails() {
    this.sessionStudentsEqMock.mockResolvedValue({
      data: null,
      error: { message: 'session students query failed' },
    });
  }

  // ─── Then assertions ─────────────────────────────────────────────────────────

  thenReturnExpectedStudentSessions(result: any) {
    expect(result).toEqual(this.expectedStudentSessions);
  }

  thenQueryBuiltWithSessionIds(sessionIds: string[]) {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.selectMock).toHaveBeenCalledWith('session_id, student_id');
    expect(this.inMock).toHaveBeenCalledWith('session_id', sessionIds);
  }

  thenQueryBuiltWithFallbackId() {
    expect(this.inMock).toHaveBeenCalledWith('session_id', [this.fallbackId]);
  }

  thenDeleteStudentSessionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.deleteMock).toHaveBeenCalledTimes(1);
    expect(this.deleteEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionIdToDelete,
    );
  }

  thenCreateStudentSessionQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.createStudentSessionInsertMock).toHaveBeenCalledWith({
      student_id: 'student-1',
      session_id: 'session-1',
    });
  }

  thenJoinedSessionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.joinedSessionsSelectMock).toHaveBeenCalledWith(
      'joined_at, sessions (*)',
    );
    expect(this.joinedSessionsEqMock).toHaveBeenCalledWith(
      'student_id',
      this.studentIdForJoinedSessions,
    );
    expect(this.joinedSessionsOrderMock).toHaveBeenCalledWith('joined_at', {
      ascending: false,
    });
  }

  thenStudentStatsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_course_stats');
    expect(this.statsSelectMock).toHaveBeenCalled();
    expect(this.statsEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseIdForStats,
    );
  }

  thenDeleteStudentCourseStatsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_course_stats');
    expect(this.statsDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.statsDeleteEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseIdForStats,
    );
  }

  thenGetStudentByUserIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('students');
    expect(this.studentByUserIdEqMock).toHaveBeenCalledWith(
      'supabase_user_id',
      this.userId,
    );
    expect(this.maybeSingleMock).toHaveBeenCalled();
  }

  thenCreateStudentQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('students');
    expect(this.insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        supabase_user_id: this.authUser.id,
        email: this.authUser.email,
      }),
    );
    expect(this.insertSelectSingleMock).toHaveBeenCalled();
  }

  thenStudentsByIdsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('students');
    expect(this.studentsByIdsSelectMock).toHaveBeenCalledWith('*');
    expect(this.studentsByIdsInMock).toHaveBeenCalledWith(
      'id',
      this.studentBatchIds,
    );
  }

  thenSessionStudentsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.sessionStudentsSelectMock).toHaveBeenCalledWith(
      this.sessionStudentsSelect,
    );
    expect(this.sessionStudentsEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionIdForStudents,
    );
  }
}
