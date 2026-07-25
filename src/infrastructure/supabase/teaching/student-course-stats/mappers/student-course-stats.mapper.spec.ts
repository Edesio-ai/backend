import { StudentCourseStatsMapper } from './student-course-stats.mapper';
import type {
  SupabaseStudentCourseStats,
  SupabaseStudentCourseStatsWithStudent,
  insertStudentCourseStats,
  UpdateStudentCourseStats,
} from 'src/domain/teaching/student-course-stats/types/student-course-stats.type';

describe('StudentCourseStatsMapper', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  describe('toDomain', () => {
    it('maps snake_case student_course_stats row', () => {
      const result = fixtures.whenToDomain();

      fixtures.thenReturnsExpectedCourseStat(result);
    });
  });

  describe('courseStatWithStudentToDomain', () => {
    it('maps embedded student relation', () => {
      const result = fixtures.whenCourseStatWithStudentToDomain();

      fixtures.thenReturnsExpectedCourseStatWithStudent(result);
    });
  });

  describe('listCourseStatsWithStudentFromQuery', () => {
    it('returns empty array when rawRows is null', () => {
      const result = fixtures.whenListFromQuery(null);

      fixtures.thenReturnsEmptyCourseStatWithStudentList(result);
    });

    it('returns empty array when rawRows is undefined', () => {
      const result = fixtures.whenListFromQuery(undefined);

      fixtures.thenReturnsEmptyCourseStatWithStudentList(result);
    });

    it('returns empty array when rawRows is not an array', () => {
      const result = fixtures.whenListFromQuery({});

      fixtures.thenReturnsEmptyCourseStatWithStudentList(result);
    });

    it('maps query rows', () => {
      const result = fixtures.whenListFromQuery([fixtures.embedRow]);

      fixtures.thenReturnsMappedCourseStatWithStudentList(result);
    });
  });

  describe('toInsert', () => {
    it('maps domain insert payload to snake_case columns', () => {
      const result = fixtures.whenToInsert();

      fixtures.thenMatchesExpectedInsert(result);
    });
  });

  describe('toUpdate', () => {
    it('maps update fields and sets last_attempt_at from current time', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-05-10T14:00:00.000Z'));

      const result = fixtures.whenToUpdate();

      fixtures.thenMatchesExpectedUpdate(result);

      jest.useRealTimers();
    });
  });
});

class Fixtures {
  public readonly supabaseFullRow: SupabaseStudentCourseStats = {
    id: 'stat-1',
    student_id: 'stu-1',
    course_id: 'course-1',
    attempted_questions: 10,
    correct_answers: 8,
    last_attempt_at: '2026-05-01T12:00:00.000Z',
  };

  public readonly expectedCourseStat = {
    id: 'stat-1',
    studentId: 'stu-1',
    courseId: 'course-1',
    attemptedQuestions: 10,
    correctAnswers: 8,
    lastAttemptAt: '2026-05-01T12:00:00.000Z',
  };

  public readonly embedRow: SupabaseStudentCourseStatsWithStudent = {
    student_id: 'stu-1',
    attempted_questions: 5,
    correct_answers: 4,
    last_attempt_at: '2026-05-02T08:00:00.000Z',
    students: {
      id: 'stu-1',
      name: 'Alice',
      email: 'alice@school.com',
      photo_url: 'https://x/p.png',
    },
  };

  public readonly expectedCourseStatWithStudent = {
    studentId: 'stu-1',
    attemptedQuestions: 5,
    correctAnswers: 4,
    lastAttemptAt: '2026-05-02T08:00:00.000Z',
    student: {
      id: 'stu-1',
      name: 'Alice',
      email: 'alice@school.com',
      photoUrl: 'https://x/p.png',
    },
  };

  public readonly insertBody: insertStudentCourseStats = {
    studentId: 'stu-1',
    courseId: 'course-1',
    attemptedQuestions: 3,
    correctAnswers: 2,
    lastAttemptAt: '2026-05-03T10:00:00.000Z',
  };

  public readonly updateBody: UpdateStudentCourseStats = {
    attemptedQuestions: 20,
    correctAnswers: 15,
  };

  whenToDomain() {
    return StudentCourseStatsMapper.toDomain(this.supabaseFullRow);
  }

  whenCourseStatWithStudentToDomain() {
    return StudentCourseStatsMapper.courseStatWithStudentToDomain(this.embedRow);
  }

  whenListFromQuery(rawRows: unknown) {
    return StudentCourseStatsMapper.listCourseStatsWithStudentFromQuery(rawRows);
  }

  whenToInsert() {
    return StudentCourseStatsMapper.toInsert(this.insertBody);
  }

  whenToUpdate() {
    return StudentCourseStatsMapper.toUpdate(this.updateBody);
  }

  thenReturnsExpectedCourseStat(result: unknown) {
    expect(result).toEqual(this.expectedCourseStat);
  }

  thenReturnsExpectedCourseStatWithStudent(result: unknown) {
    expect(result).toEqual(this.expectedCourseStatWithStudent);
  }

  thenReturnsEmptyCourseStatWithStudentList(result: unknown) {
    expect(result).toEqual([]);
  }

  thenReturnsMappedCourseStatWithStudentList(result: unknown) {
    expect(result).toEqual([this.expectedCourseStatWithStudent]);
  }

  thenMatchesExpectedInsert(result: unknown) {
    expect(result).toEqual({
      course_id: 'course-1',
      student_id: 'stu-1',
      attempted_questions: 3,
      correct_answers: 2,
      last_attempt_at: '2026-05-03T10:00:00.000Z',
    });
  }

  thenMatchesExpectedUpdate(result: unknown) {
    expect(result).toEqual({
      attempted_questions: 20,
      correct_answers: 15,
      last_attempt_at: '2026-05-10T14:00:00.000Z',
    });
  }
}
