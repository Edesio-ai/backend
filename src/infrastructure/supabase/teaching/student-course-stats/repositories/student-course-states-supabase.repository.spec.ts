import { SupabaseClient } from '@supabase/supabase-js';
import { StudentCourseStatsSupabaseRepository } from './student-course-states-supabase.repository';
import { ServerError } from 'src/domain/shared/errors/global.errors';

describe('StudentCourseStatsSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('getStudentCourseStatsByCourseId', () => {
    it('returns mapped stats with embedded students', async () => {
      fixtures.whenRankingQuerySucceeds();

      const result = await fixtures.whengetStudentCourseStatsByCourseId();

      expect(result).toEqual(fixtures.expectedStatsWithStudent);
      fixtures.thenRankingSelectBuilt();
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenRankingQueryFails();

      await expect(fixtures.whengetStudentCourseStatsByCourseId()).rejects.toThrow(ServerError);
    });
  });

  describe('getStudentCourseStatsBySessionId', () => {
    it('returns mapped stats for courses of the session', async () => {
      fixtures.whenSessionStatsQuerySucceeds();

      const result = await fixtures.whenGetStudentCourseStatsBySessionId();

      expect(result).toEqual([fixtures.expectedStatDomain]);
      fixtures.thenSessionStatsSelectBuilt();
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenSessionStatsQueryFails();

      await expect(fixtures.whenGetStudentCourseStatsBySessionId()).rejects.toThrow(ServerError);
    });
  });

  describe('deleteStudentCourseStatsByCourseId', () => {
    it('deletes rows for course id', async () => {
      fixtures.whenDeleteByCourseSucceeds();

      await fixtures.whenDeleteStudentCourseStatsByCourseId();

      fixtures.thenDeleteByCourseBuilt();
    });

    it('throws ServerError when delete fails', async () => {
      fixtures.whenDeleteByCourseFails();

      await expect(fixtures.whenDeleteStudentCourseStatsByCourseId()).rejects.toThrow(ServerError);
    });
  });

  describe('getStudentCourseStatsByStudentIdAndCourseId', () => {
    it('returns mapped row when found', async () => {
      fixtures.whenStatsMaybeSingleReturnsRow();

      const result = await fixtures.whenGetStudentCourseStatsByStudentIdAndCourseId();

      expect(result).toEqual(fixtures.expectedStatDomain);
      fixtures.thenStatsLookupBuilt();
    });

    it('returns null when no row', async () => {
      fixtures.whenStatsMaybeSingleReturnsNull();

      const result = await fixtures.whenGetStudentCourseStatsByStudentIdAndCourseId();

      expect(result).toBeNull();
    });

    it('throws ServerError when query fails', async () => {
      fixtures.whenStatsMaybeSingleFails();

      await expect(fixtures.whenGetStudentCourseStatsByStudentIdAndCourseId()).rejects.toThrow(ServerError);
    });
  });

  describe('createStudentCourseStats', () => {
    it('inserts snake_case payload from mapper', async () => {
      fixtures.whenInsertSucceeds();

      await fixtures.whenCreateStudentCourseStats();

      expect(fixtures.insertMock).toHaveBeenCalledWith({
        course_id: fixtures.courseId,
        student_id: fixtures.studentId,
        attempted_questions: 4,
        correct_answers: 3,
        last_attempt_at: fixtures.lastAttemptAt,
      });
    });

    it('throws ServerError when insert fails', async () => {
      fixtures.whenInsertFails();

      await expect(fixtures.whenCreateStudentCourseStats()).rejects.toThrow(ServerError);
    });
  });

  describe('updateStudentCourseStats', () => {
    it('updates row by stat id', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-01T09:30:00.000Z'));
      fixtures.whenUpdateSucceeds();

      await fixtures.whenUpdateStudentCourseStats();

      expect(fixtures.updateMock).toHaveBeenCalledWith({
        attempted_questions: 11,
        correct_answers: 9,
        last_attempt_at: '2026-06-01T09:30:00.000Z',
      });
      expect(fixtures.eqMock).toHaveBeenCalledWith('id', fixtures.statId);
      jest.useRealTimers();
    });

    it('throws ServerError when update fails', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-01T09:30:00.000Z'));
      fixtures.whenUpdateFails();

      await expect(fixtures.whenUpdateStudentCourseStats()).rejects.toThrow(ServerError);
      jest.useRealTimers();
    });
  });
});

class Fixtures {
  public readonly courseId = 'course-1';
  public readonly sessionId = 'session-1';
  public readonly studentId = 'stu-1';
  public readonly statId = 'stat-row-1';
  public readonly lastAttemptAt = '2026-05-01T10:00:00.000Z';

  public readonly rawRankingRows = [
    {
      student_id: this.studentId,
      attempted_questions: 10,
      correct_answers: 8,
      last_attempt_at: '2026-05-01T12:00:00.000Z',
      students: {
        id: this.studentId,
        name: 'Alice',
        email: 'alice@school.com',
        photo_url: '',
        supabase_user_id: 'auth-stu-1',
      },
    },
  ];

  public readonly expectedStatsWithStudent = [
    {
      studentId: this.studentId,
      attemptedQuestions: 10,
      correctAnswers: 8,
      lastAttemptAt: '2026-05-01T12:00:00.000Z',
      student: {
        id: this.studentId,
        name: 'Alice',
        email: 'alice@school.com',
        photoUrl: '',
        supabaseUserId: 'auth-stu-1',
      },
    },
  ];

  public readonly supabaseStatRow = {
    id: this.statId,
    student_id: this.studentId,
    course_id: this.courseId,
    attempted_questions: 10,
    correct_answers: 9,
    last_attempt_at: this.lastAttemptAt,
  };

  public readonly expectedStatDomain = {
    id: this.statId,
    studentId: this.studentId,
    courseId: this.courseId,
    attemptedQuestions: 10,
    correctAnswers: 9,
    lastAttemptAt: this.lastAttemptAt,
  };

  public readonly insertPayload = {
    studentId: this.studentId,
    courseId: this.courseId,
    attemptedQuestions: 4,
    correctAnswers: 3,
    lastAttemptAt: this.lastAttemptAt,
  };

  public readonly updatePayload = {
    studentId: this.studentId,
    courseId: this.courseId,
    attemptedQuestions: 11,
    correctAnswers: 9,
    lastAttemptAt: this.lastAttemptAt,
  };

  public readonly supabase: { from: jest.Mock };
  public readonly insertMock = jest.fn();
  public readonly updateMock = jest.fn();
  public readonly eqMock = jest.fn();
  public repository: StudentCourseStatsSupabaseRepository;

  constructor() {
    this.supabase = { from: jest.fn() };
    this.repository = new StudentCourseStatsSupabaseRepository(this.supabase as unknown as SupabaseClient);
  }

  whenRankingQuerySucceeds() {
    const eq = jest.fn().mockResolvedValue({
      data: this.rawRankingRows,
      error: null,
    });
    const select = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ select });
  }

  whenSessionStatsQuerySucceeds() {
    const eq = jest.fn().mockResolvedValue({
      data: [this.supabaseStatRow],
      error: null,
    });
    const select = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ select });
  }

  whenSessionStatsQueryFails() {
    const eq = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'session stats failed' },
    });
    const select = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ select });
  }

  whenRankingQueryFails() {
    const eq = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'ranking failed' },
    });
    const select = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ select });
  }

  whenDeleteByCourseSucceeds() {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ delete: del });
  }

  whenDeleteByCourseFails() {
    const eq = jest.fn().mockResolvedValue({
      error: { message: 'delete failed' },
    });
    const del = jest.fn().mockReturnValue({ eq });
    this.supabase.from.mockReturnValue({ delete: del });
  }

  whenStatsMaybeSingleReturnsRow() {
    const maybeSingle = jest.fn().mockResolvedValue({ data: this.supabaseStatRow, error: null });
    const eqCourse = jest.fn().mockReturnValue({ maybeSingle });
    const eqStudent = jest.fn().mockReturnValue({ eq: eqCourse });
    const select = jest.fn().mockReturnValue({ eq: eqStudent });
    this.supabase.from.mockReturnValue({ select });
  }

  whenStatsMaybeSingleReturnsNull() {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eqCourse = jest.fn().mockReturnValue({ maybeSingle });
    const eqStudent = jest.fn().mockReturnValue({ eq: eqCourse });
    const select = jest.fn().mockReturnValue({ eq: eqStudent });
    this.supabase.from.mockReturnValue({ select });
  }

  whenStatsMaybeSingleFails() {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'lookup failed' } });
    const eqCourse = jest.fn().mockReturnValue({ maybeSingle });
    const eqStudent = jest.fn().mockReturnValue({ eq: eqCourse });
    const select = jest.fn().mockReturnValue({ eq: eqStudent });
    this.supabase.from.mockReturnValue({ select });
  }

  whenInsertSucceeds() {
    this.insertMock.mockResolvedValue({ error: null });
    this.supabase.from.mockReturnValue({ insert: this.insertMock });
  }

  whenInsertFails() {
    this.insertMock.mockResolvedValue({
      error: { message: 'insert failed' },
    });
    this.supabase.from.mockReturnValue({ insert: this.insertMock });
  }

  whenUpdateSucceeds() {
    this.eqMock.mockResolvedValue({ error: null });
    this.updateMock.mockReturnValue({ eq: this.eqMock });
    this.supabase.from.mockReturnValue({ update: this.updateMock });
  }

  whenUpdateFails() {
    this.eqMock.mockResolvedValue({ error: { message: 'update failed' } });
    this.updateMock.mockReturnValue({ eq: this.eqMock });
    this.supabase.from.mockReturnValue({ update: this.updateMock });
  }

  whenGetStudentCourseStatsBySessionId() {
    return this.repository.getStudentCourseStatsBySessionId(this.sessionId);
  }

  whengetStudentCourseStatsByCourseId() {
    return this.repository.getStudentCourseStatsByCourseId(this.courseId);
  }

  whenDeleteStudentCourseStatsByCourseId() {
    return this.repository.deleteStudentCourseStatsByCourseId(this.courseId);
  }

  whenGetStudentCourseStatsByStudentIdAndCourseId() {
    return this.repository.getStudentCourseStatsByStudentIdAndCourseId(this.studentId, this.courseId);
  }

  whenCreateStudentCourseStats() {
    return this.repository.createStudentCourseStats(this.insertPayload);
  }

  whenUpdateStudentCourseStats() {
    return this.repository.updateStudentCourseStats(this.statId, this.updatePayload);
  }

  thenSessionStatsSelectBuilt() {
    expect(this.supabase.from).toHaveBeenCalledWith('student_course_stats');
    const select = this.supabase.from.mock.results.at(-1)?.value.select;
    expect(select).toHaveBeenCalledWith(expect.stringContaining('courses!inner'));
    const eq = select.mock.results[0].value.eq;
    expect(eq).toHaveBeenCalledWith('courses.session_id', this.sessionId);
  }

  thenRankingSelectBuilt() {
    expect(this.supabase.from).toHaveBeenCalledWith('student_course_stats');
    const select = this.supabase.from.mock.results.at(-1)?.value.select;
    expect(select).toHaveBeenCalledWith(expect.stringContaining('student_id'));
    const eq = select.mock.results[0].value.eq;
    expect(eq).toHaveBeenCalledWith('course_id', this.courseId);
  }

  thenDeleteByCourseBuilt() {
    expect(this.supabase.from).toHaveBeenCalledWith('student_course_stats');
    const del = this.supabase.from.mock.results.at(-1)?.value.delete;
    const eq = del.mock.results[0].value.eq;
    expect(eq).toHaveBeenCalledWith('course_id', this.courseId);
  }

  thenStatsLookupBuilt() {
    expect(this.supabase.from).toHaveBeenCalledWith('student_course_stats');
    const select = this.supabase.from.mock.results.at(-1)?.value.select;
    expect(select).toHaveBeenCalledWith('*');
    const eqStudent = select.mock.results[0].value.eq;
    expect(eqStudent).toHaveBeenCalledWith('student_id', this.studentId);
    const eqCourse = eqStudent.mock.results[0].value.eq;
    expect(eqCourse).toHaveBeenCalledWith('course_id', this.courseId);
  }
}
