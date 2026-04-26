import { StudentSupabaseRepository } from './student-supabase.repository';
import { StudentServerError } from '../../../../domain/teaching/error';

describe('StudentSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

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

  it('should throw StudentServerError when getStudentsSessionsByIds query fails', async () => {
    fixtures.whenQueryReturnsError();

    const promise = fixtures.whenGetStudentsSessionsByIds(fixtures.sessionIds);

    await fixtures.thenThrowStudentServerError(promise);
  });

  it('should delete student_sessions by session id', async () => {
    fixtures.whenDeleteStudentSessionsSucceeds();

    await fixtures.whenDeleteStudentSessionsBySessionId();

    fixtures.thenDeleteStudentSessionsQueryBuilt();
  });

  it('should throw StudentServerError when delete student_sessions fails', async () => {
    fixtures.whenDeleteStudentSessionsFails();

    const promise = fixtures.whenDeleteStudentSessionsBySessionId();

    await fixtures.thenThrowStudentServerError(promise);
  });

  it('should return student course stats mapped for course id', async () => {
    fixtures.whenStudentStatsQueryReturnsData();

    const result = await fixtures.whenGetStudentStatsByCourseId();

    fixtures.thenStudentStatsQueryBuilt();
    expect(result).toEqual(fixtures.expectedStudentCourseStats);
  });

  it('should throw StudentServerError when getStudentStatsByCourseId fails', async () => {
    fixtures.whenStudentStatsQueryFails();

    const promise = fixtures.whenGetStudentStatsByCourseId();

    await fixtures.thenThrowStudentServerError(promise);
  });

  it('should delete student course stats by course id', async () => {
    fixtures.whenDeleteStudentCourseStatsByIdSucceeds();

    await fixtures.whenDeleteStudentCourseStatsByCourseId();

    fixtures.thenDeleteStudentCourseStatsQueryBuilt();
  });

  it('should throw StudentServerError when deleteStudentCourseStatsByCourseId fails', async () => {
    fixtures.whenDeleteStudentCourseStatsByIdFails();

    const promise = fixtures.whenDeleteStudentCourseStatsByCourseId();

    await fixtures.thenThrowStudentServerError(promise);
  });
});

class Fixtures {
  public readonly sessionIds = ['session-1', 'session-2'];
  public readonly sessionIdToDelete = 'session-1';
  public readonly fallbackId = '00000000-0000-0000-0000-000000000000';
  public readonly studentSessionsSupabaseRows = [
    { session_id: 'session-1', student_id: 'student-1' },
  ];
  public readonly expectedStudentSessions = [
    { sessionId: 'session-1', studentId: 'student-1' },
  ];

  public readonly courseIdForStats = 'course-stats-1';
  public readonly studentStatsSupabaseRows = [
    {
      student_id: 'stu-1',
      attempted_questions: 10,
      correct_answers: 8,
      last_attempt_at: '2026-01-01T12:00:00.000Z',
      students: { name: 'Alice', photo_url: 'https://x/a.png' },
    },
  ];
  public readonly expectedStudentCourseStats = [
    {
      studentId: 'stu-1',
      attemptedQuestions: 10,
      correctAnswers: 8,
      lastAttemptAt: '2026-01-01T12:00:00.000Z',
      student: { name: 'Alice', photoUrl: 'https://x/a.png' },
    },
  ];

  private readonly inMock = jest.fn();
  private readonly selectMock = jest.fn(() => ({ in: this.inMock }));

  private readonly statsEqMock = jest.fn();
  private readonly statsSelectMock = jest.fn(() => ({ eq: this.statsEqMock }));

  private readonly statsDeleteEqMock = jest.fn();
  private readonly statsDeleteMock = jest.fn(() => ({
    eq: this.statsDeleteEqMock,
  }));

  private readonly deleteEqMock = jest.fn();
  private readonly deleteMock = jest.fn(() => ({ eq: this.deleteEqMock }));

  private mode: 'select' | 'delete' | 'stats' | 'stats-delete' = 'select';
  private readonly fromMock = jest.fn((table: string) => {
    if (table === 'student_course_stats') {
      if (this.mode === 'stats-delete') {
        return { delete: this.statsDeleteMock };
      }
      return { select: this.statsSelectMock };
    }
    if (this.mode === 'delete') {
      return { delete: this.deleteMock };
    }
    return { select: this.selectMock };
  });

  public readonly repository: StudentSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new StudentSupabaseRepository(supabaseMock as any);
  }

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

  whenGetStudentStatsByCourseId() {
    this.mode = 'stats';
    return this.repository.getStudentStatsByCourseId(this.courseIdForStats);
  }

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

  async thenThrowStudentServerError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(StudentServerError);
  }

  thenStudentStatsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_course_stats');
    expect(this.statsSelectMock).toHaveBeenCalled();
    expect(this.statsEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseIdForStats,
    );
  }

  thenQueryBuiltWithSessionIds(sessionIds: string[]) {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.selectMock).toHaveBeenCalledWith('session_id, student_id');
    expect(this.inMock).toHaveBeenCalledWith('session_id', sessionIds);
  }

  thenQueryBuiltWithFallbackId() {
    expect(this.inMock).toHaveBeenCalledWith('session_id', [this.fallbackId]);
  }

  thenReturnExpectedStudentSessions(result: any) {
    expect(result).toEqual(this.expectedStudentSessions);
  }

  thenDeleteStudentSessionsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_sessions');
    expect(this.deleteMock).toHaveBeenCalledTimes(1);
    expect(this.deleteEqMock).toHaveBeenCalledWith(
      'session_id',
      this.sessionIdToDelete,
    );
  }

  whenDeleteStudentCourseStatsByCourseId() {
    this.mode = 'stats-delete';
    return this.repository.deleteStudentCourseStatsByCourseId(
      this.courseIdForStats,
    );
  }

  whenDeleteStudentCourseStatsByIdSucceeds() {
    this.statsDeleteEqMock.mockResolvedValue({ error: null });
  }

  whenDeleteStudentCourseStatsByIdFails() {
    this.statsDeleteEqMock.mockResolvedValue({
      error: { message: 'delete stats failed' },
    });
  }

  thenDeleteStudentCourseStatsQueryBuilt() {
    expect(this.fromMock).toHaveBeenCalledWith('student_course_stats');
    expect(this.statsDeleteMock).toHaveBeenCalledTimes(1);
    expect(this.statsDeleteEqMock).toHaveBeenCalledWith(
      'course_id',
      this.courseIdForStats,
    );
  }
}
