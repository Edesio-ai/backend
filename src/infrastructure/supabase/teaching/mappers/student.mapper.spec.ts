import { StudentMapper } from './student.mapper';
import { mapList } from 'src/infrastructure/supabase/common/mapper.util';
import {
  SupabaseStudentSession,
  SupabaseStudentCourseStats,
  SupabaseStudentCourseStatsWithStudent,
  SupabaseStudentJoinedSession,
  SupabaseSessionStudent,
} from 'src/domain/teaching/types/student.type';

describe('StudentMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('sessionToDomain', () => {
    it('maps snake_case row to domain StudentSession', () => {
      const result = fixtures.whenSessionToDomain();

      fixtures.thenReturnsExpectedStudentSession(result);
    });

    it('maps an array of rows via mapList', () => {
      const result = fixtures.whenMapListSessionRows();

      fixtures.thenMatchesExpectedMappedSessions(result);
    });
  });

  describe('courseStatToDomain', () => {
    it('maps a student course stats row', () => {
      const result = fixtures.whenCourseStatToDomain();

      fixtures.thenReturnsExpectedCourseStat(result);
    });

    it('returns empty array via mapList for empty input', () => {
      const result = fixtures.whenMapListCourseStatsEmpty();

      fixtures.thenMatchesEmptyCourseStatsList(result);
    });

    it('maps multiple rows correctly via mapList', () => {
      const result = fixtures.whenMapListCourseStatsMultiple();

      fixtures.thenMatchesMultipleCourseStats(result);
    });
  });

  describe('studentCourseStatToDomain', () => {
    it('maps a full student_course_stats row', () => {
      const result = fixtures.whenStudentCourseStatToDomain();

      fixtures.thenReturnsExpectedStudentCourseStat(result);
    });
  });

  describe('studentCourseStatToInsert', () => {
    it('maps domain insert payload to snake_case columns', () => {
      const result = fixtures.whenStudentCourseStatToInsert();

      fixtures.thenMatchesExpectedStudentCourseStatInsert(result);
    });
  });

  describe('studentCourseStatToUpdate', () => {
    it('maps update fields and sets last_attempt_at from current time', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-05-05T12:30:00.000Z'));

      const result = fixtures.whenStudentCourseStatToUpdate();

      fixtures.thenMatchesExpectedStudentCourseStatUpdate(result);

      jest.useRealTimers();
    });
  });

  describe('joinedSessionToDomain', () => {
    it('maps a row to a flat StudentJoinedSession', () => {
      const result = fixtures.whenJoinedSessionMapListSingle();

      fixtures.thenMatchesExpectedJoinedSessionSingle(result);
    });

    it('returns an empty array for empty input', () => {
      const result = fixtures.whenJoinedSessionMapListEmpty();

      fixtures.thenMatchesEmptyJoinedSessions(result);
    });

    it('maps multiple rows preserving order', () => {
      const result = fixtures.whenJoinedSessionMapListMultiple();

      fixtures.thenMatchesJoinedSessionsOrder(result);
    });
  });

  describe('studentSessionToDomain', () => {
    it('maps a SupabaseSessionStudent row to a flat SessionStudent', () => {
      const result = fixtures.whenStudentSessionToDomainSingle();

      fixtures.thenReturnsExpectedSessionStudent(result);
    });

    it('returns an empty array for empty input via mapList', () => {
      const result = fixtures.whenStudentSessionMapListEmpty();

      fixtures.thenMatchesEmptyStudentSessions(result);
    });

    it('maps multiple rows preserving order via mapList', () => {
      const result = fixtures.whenStudentSessionMapListMultiple();

      fixtures.thenMatchesStudentSessionsOrder(result);
    });

    it('handles an empty photo_url correctly', () => {
      const result = fixtures.whenStudentSessionToDomainEmptyPhoto();

      fixtures.thenSessionStudentPhotoUrlEmpty(result);
    });
  });
});

class Fixtures {
  public readonly studentSessionRow: SupabaseStudentSession = {
    session_id: 's-1',
    student_id: 'st-1',
  };

  public readonly expectedStudentSession = {
    sessionId: 's-1',
    studentId: 'st-1',
  };

  public readonly studentSessionRows: SupabaseStudentSession[] = [
    { session_id: 's-1', student_id: 'a' },
    { session_id: 's-2', student_id: 'b' },
  ];

  public readonly expectedMappedStudentSessions = [
    { sessionId: 's-1', studentId: 'a' },
    { sessionId: 's-2', studentId: 'b' },
  ];

  public readonly courseStatRow: SupabaseStudentCourseStatsWithStudent = {
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
  };

  public readonly expectedCourseStat = {
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
  };

  public readonly multipleCourseStatRows: SupabaseStudentCourseStatsWithStudent[] =
    [
      {
        student_id: 'stu-1',
        attempted_questions: 5,
        correct_answers: 3,
        last_attempt_at: '2026-01-01T10:00:00.000Z',
        students: {
          id: 'stu-1',
          name: 'Bob',
          email: 'bob@x.com',
          photo_url: '',
        },
      },
      {
        student_id: 'stu-2',
        attempted_questions: 0,
        correct_answers: 0,
        last_attempt_at: '2026-01-02T00:00:00.000Z',
        students: {
          id: 'stu-2',
          name: 'Eve',
          email: 'eve@x.com',
          photo_url: 'https://x/e.png',
        },
      },
    ];

  public readonly studentCourseStatRow: SupabaseStudentCourseStats = {
    id: 'stat-1',
    course_id: 'course-1',
    student_id: 'stu-1',
    attempted_questions: 10,
    correct_answers: 7,
    last_attempt_at: '2026-03-01T08:00:00.000Z',
  };

  public readonly expectedStudentCourseStat = {
    id: 'stat-1',
    courseId: 'course-1',
    studentId: 'stu-1',
    attemptedQuestions: 10,
    correctAnswers: 7,
    lastAttemptAt: '2026-03-01T08:00:00.000Z',
  };

  public readonly baseJoinedSessionRow: SupabaseStudentJoinedSession = {
    joined_at: '2026-01-15T10:00:00.000Z',
    sessions: {
      id: 'session-1',
      teacher_id: 'teacher-1',
      name: 'Session de maths',
      code: 'ABC123',
      language: 'francais',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  };

  public readonly joinedSessionRows: SupabaseStudentJoinedSession[] = [
    {
      joined_at: '2026-02-01T00:00:00.000Z',
      sessions: {
        id: 'session-2',
        teacher_id: 'teacher-1',
        name: "Session d'anglais",
        code: 'XYZ789',
        language: 'anglais',
        created_at: '2026-01-05T00:00:00.000Z',
      },
    },
    this.baseJoinedSessionRow,
  ];

  public readonly sessionStudentRow: SupabaseSessionStudent = {
    joined_at: '2026-01-15T10:00:00.000Z',
    students: {
      id: 'student-1',
      name: 'Alice',
      email: 'alice@school.com',
      photo_url: 'https://x/a.png',
    },
  };

  public readonly expectedSessionStudent = {
    id: 'student-1',
    name: 'Alice',
    email: 'alice@school.com',
    photoUrl: 'https://x/a.png',
    joinedAt: '2026-01-15T10:00:00.000Z',
  };

  public readonly multipleSessionStudentRows: SupabaseSessionStudent[] = [
    {
      joined_at: '2026-01-15T10:00:00.000Z',
      students: {
        id: 'student-1',
        name: 'Alice',
        email: 'alice@school.com',
        photo_url: 'https://x/a.png',
      },
    },
    {
      joined_at: '2026-01-16T08:00:00.000Z',
      students: {
        id: 'student-2',
        name: 'Bob',
        email: 'bob@school.com',
        photo_url: '',
      },
    },
  ];

  public readonly sessionStudentRowEmptyPhoto: SupabaseSessionStudent = {
    joined_at: '2026-01-15T10:00:00.000Z',
    students: {
      id: 'student-3',
      name: 'Charlie',
      email: 'charlie@school.com',
      photo_url: '',
    },
  };

  whenSessionToDomain() {
    return StudentMapper.sessionToDomain(this.studentSessionRow);
  }

  whenMapListSessionRows() {
    return mapList(this.studentSessionRows, StudentMapper.sessionToDomain);
  }

  whenCourseStatToDomain() {
    return StudentMapper.courseStatToDomain(this.courseStatRow);
  }

  whenMapListCourseStatsEmpty() {
    return mapList([], StudentMapper.courseStatToDomain);
  }

  whenMapListCourseStatsMultiple() {
    return mapList(
      this.multipleCourseStatRows,
      StudentMapper.courseStatToDomain,
    );
  }

  whenStudentCourseStatToDomain() {
    return StudentMapper.studentCourseStatToDomain(this.studentCourseStatRow);
  }

  whenStudentCourseStatToInsert() {
    return StudentMapper.studentCourseStatToInsert({
      studentId: 's-1',
      courseId: 'c-1',
      attemptedQuestions: 5,
      correctAnswers: 4,
      lastAttemptAt: '2026-04-01T00:00:00.000Z',
    });
  }

  whenStudentCourseStatToUpdate() {
    return StudentMapper.studentCourseStatToUpdate({
      attemptedQuestions: 20,
      correctAnswers: 18,
    });
  }

  whenJoinedSessionMapListSingle() {
    return mapList(
      [this.baseJoinedSessionRow],
      StudentMapper.joinedSessionToDomain,
    );
  }

  whenJoinedSessionMapListEmpty() {
    return mapList([], StudentMapper.joinedSessionToDomain);
  }

  whenJoinedSessionMapListMultiple() {
    return mapList(this.joinedSessionRows, StudentMapper.joinedSessionToDomain);
  }

  whenStudentSessionToDomainSingle() {
    return StudentMapper.studentSessionToDomain(this.sessionStudentRow);
  }

  whenStudentSessionMapListEmpty() {
    return mapList([], StudentMapper.studentSessionToDomain);
  }

  whenStudentSessionMapListMultiple() {
    return mapList(
      this.multipleSessionStudentRows,
      StudentMapper.studentSessionToDomain,
    );
  }

  whenStudentSessionToDomainEmptyPhoto() {
    return StudentMapper.studentSessionToDomain(
      this.sessionStudentRowEmptyPhoto,
    );
  }

  thenReturnsExpectedStudentSession(result: unknown) {
    expect(result).toEqual(this.expectedStudentSession);
  }

  thenMatchesExpectedMappedSessions(result: unknown) {
    expect(result).toEqual(this.expectedMappedStudentSessions);
  }

  thenReturnsExpectedCourseStat(result: unknown) {
    expect(result).toEqual(this.expectedCourseStat);
  }

  thenMatchesEmptyCourseStatsList(result: unknown) {
    expect(result).toEqual([]);
  }

  thenMatchesMultipleCourseStats(result: unknown) {
    expect(result).toHaveLength(2);
    expect(
      (result as { student: { name: string; photoUrl: string } }[])[0].student
        .name,
    ).toBe('Bob');
    expect(
      (result as { student: { photoUrl: string } }[])[0].student.photoUrl,
    ).toBe('');
    expect(
      (result as { student: { photoUrl: string } }[])[1].student.photoUrl,
    ).toBe('https://x/e.png');
  }

  thenReturnsExpectedStudentCourseStat(result: unknown) {
    expect(result).toEqual(this.expectedStudentCourseStat);
  }

  thenMatchesExpectedStudentCourseStatInsert(result: unknown) {
    expect(result).toEqual({
      student_id: 's-1',
      course_id: 'c-1',
      attempted_questions: 5,
      correct_answers: 4,
      last_attempt_at: '2026-04-01T00:00:00.000Z',
    });
  }

  thenMatchesExpectedStudentCourseStatUpdate(result: unknown) {
    expect(result).toEqual({
      attempted_questions: 20,
      correct_answers: 18,
      last_attempt_at: '2026-05-05T12:30:00.000Z',
    });
  }

  thenMatchesExpectedJoinedSessionSingle(result: unknown) {
    expect(result).toEqual([
      {
        id: 'session-1',
        teacherId: 'teacher-1',
        name: 'Session de maths',
        code: 'ABC123',
        language: 'francais',
        createdAt: '2026-01-01T00:00:00.000Z',
        joinedAt: '2026-01-15T10:00:00.000Z',
      },
    ]);
  }

  thenMatchesEmptyJoinedSessions(result: unknown) {
    expect(result).toEqual([]);
  }

  thenMatchesJoinedSessionsOrder(result: unknown) {
    expect(result).toHaveLength(2);
    expect((result as { id: string; joinedAt: string }[])[0].id).toBe(
      'session-2',
    );
    expect((result as { joinedAt: string }[])[0].joinedAt).toBe(
      '2026-02-01T00:00:00.000Z',
    );
    expect((result as { id: string }[])[1].id).toBe('session-1');
  }

  thenReturnsExpectedSessionStudent(result: unknown) {
    expect(result).toEqual(this.expectedSessionStudent);
  }

  thenMatchesEmptyStudentSessions(result: unknown) {
    expect(result).toEqual([]);
  }

  thenMatchesStudentSessionsOrder(result: unknown) {
    expect(result).toHaveLength(2);
    expect((result as { id: string; joinedAt: string }[])[0].id).toBe(
      'student-1',
    );
    expect((result as { joinedAt: string }[])[0].joinedAt).toBe(
      '2026-01-15T10:00:00.000Z',
    );
    expect((result as { id: string }[])[1].id).toBe('student-2');
    expect((result as { photoUrl: string }[])[1].photoUrl).toBe('');
  }

  thenSessionStudentPhotoUrlEmpty(result: unknown) {
    expect(
      (
        result as {
          photoUrl: string;
        }
      ).photoUrl,
    ).toBe('');
  }
}
