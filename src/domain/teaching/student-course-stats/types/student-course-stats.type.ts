import { Student, SupabaseStudent } from '../../student/type/student.type';

export type CourseRanking = {
  studentId: string;
  name: string;
  photoUrl: string | null;
  attemptedQuestions: number;
  correctAnswers: number;
  successRate: number;
  rank: number;
  lastAttempt: string;
};

export type CourseRankingWithRate = Omit<CourseRanking, 'rank'>;

export type SupabaseStudentCourseStats = {
  id: string;
  course_id: string;
  student_id: string;
  attempted_questions: number;
  correct_answers: number;
  last_attempt_at: string;
};
export type SupabaseStudentCourseStatsWithStudent = Omit<SupabaseStudentCourseStats, 'id' | 'course_id'> & {
  students: Omit<SupabaseStudent, 'supabase_user_id' | 'created_at'>;
};

export type StudentCourseStats = {
  id: string;
  courseId: string;
  studentId: string;
  attemptedQuestions: number;
  correctAnswers: number;
  lastAttemptAt: string;
};

export type StudentCourseStatsWithStudent = Omit<StudentCourseStats, 'id' | 'courseId'> & {
  student: Omit<Student, 'supabaseUserId' | 'createdAt'>;
};

export type insertStudentCourseStats = Omit<StudentCourseStats, 'id'>;

export type supabaseInsertStudentCourseStats = Omit<SupabaseStudentCourseStats, 'id'>;
export type UpdateStudentCourseStats = Omit<StudentCourseStats, 'id' | 'courseId' | 'studentId' | 'lastAttemptAt'>;
export type supabaseUpdateStudentCourseStats = Omit<SupabaseStudentCourseStats, 'id' | 'course_id' | 'student_id'>;
