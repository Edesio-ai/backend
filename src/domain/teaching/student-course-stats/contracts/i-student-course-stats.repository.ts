import type {
  StudentCourseStats,
  StudentCourseStatsWithStudent,
} from '../../student/type/student.type';

export const STUDENT_COURSE_STATS_REPOSITORY = Symbol(
  'STUDENT_COURSE_STATS_REPOSITORY',
);

export interface IStudentCourseStatsRepository {
  getStudentStatsByCourseId(
    courseId: string,
  ): Promise<StudentCourseStatsWithStudent[]>;
  deleteStudentCourseStatsByCourseId(courseId: string): Promise<void>;
  getStudentCourseStatsByStudentIdAndCourseId(
    studentId: string,
    courseId: string,
  ): Promise<StudentCourseStats | null>;
  createStudentCourseStats(
    statToInsert: Omit<StudentCourseStats, 'id'>,
  ): Promise<void>;
  updateStudentCourseStats(
    statId: string,
    statToUpdate: Omit<
      StudentCourseStats,
      'id' | 'courseId' | 'studentId' | 'lastAttemptAt'
    >,
  ): Promise<void>;
}
