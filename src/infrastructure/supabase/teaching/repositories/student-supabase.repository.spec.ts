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

  // ─── storeStudentPhoto ───────────────────────────────────────────────────────

  it('should upload the photo and return the public url', async () => {
    fixtures.whenStorageUploadSucceeds();

    const result = await fixtures.whenStoreStudentPhoto();

    fixtures.thenStorageUploadCalledWith();
    expect(result).toBe(fixtures.expectedPhotoUrl);
  });

  it('should throw ServerError when the storage upload fails', async () => {
    fixtures.whenStorageUploadFails();

    await expect(fixtures.whenStoreStudentPhoto()).rejects.toBeInstanceOf(
      ServerError,
    );
  });

  // ─── updateStudentPhoto ──────────────────────────────────────────────────────

  it('should update the student photo url', async () => {
    fixtures.whenUpdateStudentPhotoSucceeds();

    await fixtures.whenUpdateStudentPhoto();

    fixtures.thenUpdateStudentPhotoQueryBuilt();
  });

  it('should throw ServerError when updateStudentPhoto query fails', async () => {
    fixtures.whenUpdateStudentPhotoFails();

    await expect(fixtures.whenUpdateStudentPhoto()).rejects.toBeInstanceOf(
      ServerError,
    );
  });

  // ─── getStudentSessionsBySessionId ──────────────────────────────────────────

  it('should return mapped session students for a session id', async () => {
    fixtures.whenSessionStudentsQueryReturnsData();

    const result = await fixtures.whenGetStudentSessionsBySessionId();

    fixtures.thenSessionStudentsQueryBuilt();
    expect(result).toEqual(fixtures.expectedSessionStudents);
  });

  it('should return an empty array when no students are in the session', async () => {
    fixtures.whenSessionStudentsQueryReturnsEmpty();

    const result = await fixtures.whenGetStudentSessionsBySessionId();

    expect(result).toEqual([]);
  });

  it('should throw ServerError when getStudentSessionsBySessionId query fails', async () => {
    fixtures.whenSessionStudentsQueryFails();

    await expect(
      fixtures.whenGetStudentSessionsBySessionId(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── getStudentSessionBySessionId ───────────────────────────────────────────

  it('should return a mapped student session when found', async () => {
    fixtures.whenStudentSessionBySessionIdReturnsData();

    const result = await fixtures.whenGetStudentSessionBySessionId();

    fixtures.thenStudentSessionBySessionIdQueryBuilt();
    expect(result).toEqual(fixtures.expectedStudentSessions[0]);
  });

  it('should return null when no student session found', async () => {
    fixtures.whenStudentSessionBySessionIdReturnsNull();

    const result = await fixtures.whenGetStudentSessionBySessionId();

    expect(result).toBeNull();
  });

  it('should throw ServerError when getStudentSessionBySessionId query fails', async () => {
    fixtures.whenStudentSessionBySessionIdFails();

    await expect(
      fixtures.whenGetStudentSessionBySessionId(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── deleteStudentSession ────────────────────────────────────────────────────

  it('should delete a student session successfully', async () => {
    fixtures.whenDeleteStudentSessionSucceeds();

    await fixtures.whenDeleteStudentSession();

    fixtures.thenDeleteStudentSessionQueryBuilt();
  });

  it('should throw ServerError when deleteStudentSession query fails', async () => {
    fixtures.whenDeleteStudentSessionFails();

    await expect(fixtures.whenDeleteStudentSession()).rejects.toBeInstanceOf(
      ServerError,
    );
  });

  // ─── getStudentCourseStatsByStudentIdAndCourseId ─────────────────────────────

  it('should return mapped student course stats when row exists', async () => {
    fixtures.whenCourseStatByStudentCourseReturnsData();

    const result =
      await fixtures.whenGetStudentCourseStatsByStudentIdAndCourseId();

    fixtures.thenCourseStatByStudentCourseQueryBuilt();
    expect(result).toEqual(fixtures.expectedSingleStudentCourseStat);
  });

  it('should return null when no student course stat row', async () => {
    fixtures.whenCourseStatByStudentCourseReturnsNull();

    const result =
      await fixtures.whenGetStudentCourseStatsByStudentIdAndCourseId();

    expect(result).toBeNull();
  });

  it('should throw ServerError when getStudentCourseStatsByStudentIdAndCourseId fails', async () => {
    fixtures.whenCourseStatByStudentCourseQueryFails();

    await expect(
      fixtures.whenGetStudentCourseStatsByStudentIdAndCourseId(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── createStudentCourseStats ────────────────────────────────────────────────

  it('should insert student course stats', async () => {
    fixtures.whenCreateStudentCourseStatsSucceeds();

    await fixtures.whenCreateStudentCourseStats();

    fixtures.thenCreateStudentCourseStatsInsertBuilt();
  });

  it('should throw ServerError when createStudentCourseStats fails', async () => {
    fixtures.whenCreateStudentCourseStatsFails();

    await expect(
      fixtures.whenCreateStudentCourseStats(),
    ).rejects.toBeInstanceOf(ServerError);
  });

  // ─── updateStudentCourseStats ────────────────────────────────────────────────

  it('should update student course stats by id', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-05T15:00:00.000Z'));
    fixtures.whenUpdateStudentCourseStatsSucceeds();

    await fixtures.whenUpdateStudentCourseStats();

    fixtures.thenUpdateStudentCourseStatsQueryBuilt();
    jest.useRealTimers();
  });

  it('should throw ServerError when updateStudentCourseStats fails', async () => {
    fixtures.whenUpdateStudentCourseStatsFails();

    await expect(
      fixtures.whenUpdateStudentCourseStats(),
    ).rejects.toBeInstanceOf(ServerError);
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

  public readonly photoStoragePath = 'student-1/1234567890.jpg';
  public readonly photoBuffer = Buffer.from('fake-image');
  public readonly expectedPhotoUrl =
    'https://storage.example.com/profile-photos/student-1/1234567890.jpg';

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

  public readonly studentIdForCourseStat = 'student-1';
  public readonly courseIdForSingleStat = 'course-stat-1';
  public readonly singleStudentCourseStatSupabaseRow = {
    id: 'stat-row-1',
    student_id: 'student-1',
    course_id: 'course-stat-1',
    attempted_questions: 3,
    correct_answers: 2,
    last_attempt_at: '2026-01-10T00:00:00.000Z',
  };
  public readonly expectedSingleStudentCourseStat = {
    id: 'stat-row-1',
    studentId: 'student-1',
    courseId: 'course-stat-1',
    attemptedQuestions: 3,
    correctAnswers: 2,
    lastAttemptAt: '2026-01-10T00:00:00.000Z',
  };
  public readonly statToInsert = {
    studentId: 'student-1',
    courseId: 'course-stat-1',
    attemptedQuestions: 4,
    correctAnswers: 3,
    lastAttemptAt: '2026-01-11T00:00:00.000Z',
  };
  public readonly statIdToUpdate = 'stat-update-1';
  public readonly statToUpdatePayload = {
    studentId: 'student-1',
    courseId: 'course-stat-1',
    attemptedQuestions: 10,
    correctAnswers: 9,
    lastAttemptAt: '2026-01-01T00:00:00.000Z',
  };

  // ─── Supabase chain mocks ────────────────────────────────────────────────────

  private readonly inMock = jest.fn();
  private readonly selectMock = jest.fn(() => ({ in: this.inMock }));

  // getStudentSessionsBySessionId chain: .select(select).eq(...)
  private readonly sessionStudentsEqMock = jest.fn();
  private readonly sessionStudentsSelectMock = jest.fn(() => ({
    eq: this.sessionStudentsEqMock,
  }));

  // getStudentSessionBySessionId chain: .select('*').eq(...).maybeSingle()
  private readonly studentSessionBySessionIdMaybeSingleMock = jest.fn();
  private readonly studentSessionBySessionIdEqMock = jest.fn(() => ({
    maybeSingle: this.studentSessionBySessionIdMaybeSingleMock,
  }));
  private readonly studentSessionBySessionIdSelectMock = jest.fn(() => ({
    eq: this.studentSessionBySessionIdEqMock,
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

  // storeStudentPhoto chain: supabase.storage.from(...).upload(...) then .getPublicUrl(...)
  private readonly storageUploadMock = jest.fn();
  private readonly storageGetPublicUrlMock = jest.fn();
  private readonly storageFromMock = jest.fn(() => ({
    upload: this.storageUploadMock,
    getPublicUrl: this.storageGetPublicUrlMock,
  }));

  // updateStudentPhoto chain: .from('students').update(...).eq(...)
  private readonly updateStudentPhotoEqMock = jest.fn();
  private readonly updateStudentPhotoUpdateMock = jest.fn(() => ({
    eq: this.updateStudentPhotoEqMock,
  }));

  // getStudentsByIds chain: .select('*').in('id', ids)
  private readonly studentsByIdsInMock = jest.fn();
  private readonly studentsByIdsSelectMock = jest.fn(() => ({
    in: this.studentsByIdsInMock,
  }));

  // deleteStudentSession chain: .delete().eq('session_id', ...).eq('student_id', ...)
  private readonly deleteStudentSessionSecondEqMock = jest.fn();
  private readonly deleteStudentSessionFirstEqMock = jest.fn(() => ({
    eq: this.deleteStudentSessionSecondEqMock,
  }));
  private readonly deleteStudentSessionDeleteMock = jest.fn(() => ({
    eq: this.deleteStudentSessionFirstEqMock,
  }));

  private readonly statsByStudentCourseMaybeSingleMock = jest.fn();
  private readonly statsByStudentCourseSecondEqMock = jest.fn(() => ({
    maybeSingle: this.statsByStudentCourseMaybeSingleMock,
  }));
  private readonly statsByStudentCourseFirstEqMock = jest.fn(() => ({
    eq: this.statsByStudentCourseSecondEqMock,
  }));
  private readonly statsByStudentCourseSelectMock = jest.fn(() => ({
    eq: this.statsByStudentCourseFirstEqMock,
  }));

  public readonly courseStatsInsertMock = jest.fn();

  private readonly courseStatsUpdateEqMock = jest.fn();
  private readonly courseStatsUpdateUpdateMock = jest.fn(() => ({
    eq: this.courseStatsUpdateEqMock,
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
    | 'student-session-by-session-id'
    | 'get-students-by-ids'
    | 'update-student-photo'
    | 'delete-student-session'
    | 'stats-by-student-course'
    | 'stats-insert'
    | 'stats-update' = 'select';

  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'student_course_stats') {
      if (this.mode === 'stats-delete') {
        return { delete: this.statsDeleteMock };
      }
      if (this.mode === 'stats-insert') {
        return { insert: this.courseStatsInsertMock };
      }
      if (this.mode === 'stats-update') {
        return { update: this.courseStatsUpdateUpdateMock };
      }
      if (this.mode === 'stats-by-student-course') {
        return { select: this.statsByStudentCourseSelectMock };
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
      if (this.mode === 'update-student-photo') {
        return { update: this.updateStudentPhotoUpdateMock };
      }
      return { select: this.studentByUserIdSelectMock };
    }
    if (this.mode === 'delete') {
      return { delete: this.deleteMock };
    }
    if (this.mode === 'delete-student-session') {
      return { delete: this.deleteStudentSessionDeleteMock };
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
    if (this.mode === 'student-session-by-session-id') {
      return { select: this.studentSessionBySessionIdSelectMock };
    }
    return { select: this.selectMock };
  });

  public readonly repository: StudentSupabaseRepository;

  constructor() {
    this.repository = new StudentSupabaseRepository({
      from: this.fromMock,
      storage: { from: this.storageFromMock },
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

  whenStoreStudentPhoto() {
    return this.repository.storeStudentPhoto(
      this.photoBuffer,
      this.photoStoragePath,
    );
  }

  whenUpdateStudentPhoto() {
    this.mode = 'update-student-photo';
    return this.repository.updateStudentPhoto(
      'student-1',
      this.expectedPhotoUrl,
    );
  }

  whenGetStudentsByIds() {
    this.mode = 'get-students-by-ids';
    return this.repository.getStudentsByIds(this.studentBatchIds);
  }

  whenGetStudentSessionsBySessionId() {
    this.mode = 'session-students';
    return this.repository.getStudentSessionsBySessionId(
      this.sessionIdForStudents,
      this.sessionStudentsSelect,
    );
  }

  whenGetStudentSessionBySessionId() {
    this.mode = 'student-session-by-session-id';
    return this.repository.getStudentSessionBySessionId(
      this.sessionIdForStudents,
    );
  }

  whenDeleteStudentSession() {
    this.mode = 'delete-student-session';
    return this.repository.deleteStudentSession(
      this.sessionIdToDelete,
      'student-1',
    );
  }

  whenGetStudentCourseStatsByStudentIdAndCourseId() {
    this.mode = 'stats-by-student-course';
    return this.repository.getStudentCourseStatsByStudentIdAndCourseId(
      this.studentIdForCourseStat,
      this.courseIdForSingleStat,
    );
  }

  whenCreateStudentCourseStats() {
    this.mode = 'stats-insert';
    return this.repository.createStudentCourseStats(this.statToInsert);
  }

  whenUpdateStudentCourseStats() {
    this.mode = 'stats-update';
    return this.repository.updateStudentCourseStats(
      this.statIdToUpdate,
      this.statToUpdatePayload,
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

  whenStorageUploadSucceeds() {
    this.storageUploadMock.mockResolvedValue({ error: null });
    this.storageGetPublicUrlMock.mockReturnValue({
      data: { publicUrl: this.expectedPhotoUrl },
    });
  }

  whenStorageUploadFails() {
    this.storageUploadMock.mockResolvedValue({
      error: { message: 'storage upload failed' },
    });
  }

  whenUpdateStudentPhotoSucceeds() {
    this.updateStudentPhotoEqMock.mockResolvedValue({ error: null });
  }

  whenUpdateStudentPhotoFails() {
    this.updateStudentPhotoEqMock.mockResolvedValue({
      error: { message: 'update photo failed' },
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

  whenStudentSessionBySessionIdReturnsData() {
    this.studentSessionBySessionIdMaybeSingleMock.mockResolvedValue({
      data: this.studentSessionsSupabaseRows[0],
      error: null,
    });
  }

  whenStudentSessionBySessionIdReturnsNull() {
    this.studentSessionBySessionIdMaybeSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenStudentSessionBySessionIdFails() {
    this.studentSessionBySessionIdMaybeSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'student session by session id query failed' },
    });
  }

  whenDeleteStudentSessionSucceeds() {
    this.deleteStudentSessionSecondEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteStudentSessionFails() {
    this.deleteStudentSessionSecondEqMock.mockResolvedValue({
      error: { message: 'delete student session failed' },
    });
  }

  whenCourseStatByStudentCourseReturnsData() {
    this.statsByStudentCourseMaybeSingleMock.mockResolvedValue({
      data: this.singleStudentCourseStatSupabaseRow,
      error: null,
    });
  }

  whenCourseStatByStudentCourseReturnsNull() {
    this.statsByStudentCourseMaybeSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  }

  whenCourseStatByStudentCourseQueryFails() {
    this.statsByStudentCourseMaybeSingleMock.mockResolvedValue({
      data: null,
      error: { message: 'course stat query failed' },
    });
  }

  whenCreateStudentCourseStatsSucceeds() {
    this.courseStatsInsertMock.mockResolvedValue({ error: null });
  }

  whenCreateStudentCourseStatsFails() {
    this.courseStatsInsertMock.mockResolvedValue({
      error: { message: 'insert course stats failed' },
    });
  }

  whenUpdateStudentCourseStatsSucceeds() {
    this.courseStatsUpdateEqMock.mockResolvedValue({ error: null });
  }

  whenUpdateStudentCourseStatsFails() {
    this.courseStatsUpdateEqMock.mockResolvedValue({
      error: { message: 'update course stats failed' },
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

  thenStorageUploadCalledWith() {
    expect(this.storageFromMock).toHaveBeenCalledWith('profile-photos');
    expect(this.storageUploadMock).toHaveBeenCalledWith(
      this.photoStoragePath,
      this.photoBuffer,
      { upsert: true },
    );
    expect(this.storageGetPublicUrlMock).toHaveBeenCalledWith(
      this.photoStoragePath,
    );
  }

  thenUpdateStudentPhotoQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('students');
    expect(this.updateStudentPhotoUpdateMock).toHaveBeenCalledWith({
      photo_url: this.expectedPhotoUrl,
    });
    expect(this.updateStudentPhotoEqMock).toHaveBeenCalledWith(
      'id',
      'student-1',
    );
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

  thenStudentSessionBySessionIdQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.studentSessionBySessionIdSelectMock).toHaveBeenCalledWith('*');
    expect(this.studentSessionBySessionIdEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionIdForStudents,
    );
    expect(this.studentSessionBySessionIdMaybeSingleMock).toHaveBeenCalled();
  }

  thenDeleteStudentSessionQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.deleteStudentSessionDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.deleteStudentSessionFirstEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionIdToDelete,
    );
    expect(this.deleteStudentSessionSecondEqMock).toHaveBeenCalledWith(
      'student_id',
      'student-1',
    );
  }

  thenCourseStatByStudentCourseQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_course_stats');
    expect(this.statsByStudentCourseSelectMock).toHaveBeenCalledWith('*');
    expect(this.statsByStudentCourseFirstEqMock).toHaveBeenCalledWith(
      'student_id',
      this.studentIdForCourseStat,
    );
    expect(this.statsByStudentCourseSecondEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseIdForSingleStat,
    );
    expect(this.statsByStudentCourseMaybeSingleMock).toHaveBeenCalled();
  }

  thenCreateStudentCourseStatsInsertBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_course_stats');
    expect(this.courseStatsInsertMock).toHaveBeenCalledWith({
      student_id: this.statToInsert.studentId,
      course_id: this.statToInsert.courseId,
      attempted_questions: this.statToInsert.attemptedQuestions,
      correct_answers: this.statToInsert.correctAnswers,
      last_attempt_at: this.statToInsert.lastAttemptAt,
    });
  }

  thenUpdateStudentCourseStatsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_course_stats');
    expect(this.courseStatsUpdateUpdateMock).toHaveBeenCalledWith({
      attempted_questions: this.statToUpdatePayload.attemptedQuestions,
      correct_answers: this.statToUpdatePayload.correctAnswers,
      last_attempt_at: '2026-05-05T15:00:00.000Z',
    });
    expect(this.courseStatsUpdateEqMock).toHaveBeenCalledWith(
      'id',
      this.statIdToUpdate,
    );
  }
}
