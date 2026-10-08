import type {
  insertStudentCourseStats,
  StudentCourseStats,
  StudentCourseStatsWithStudent,
  supabaseInsertStudentCourseStats,
  SupabaseStudentCourseStats,
  SupabaseStudentCourseStatsWithStudent,
  supabaseUpdateStudentCourseStats,
  UpdateStudentCourseStats,
} from 'src/domain/teaching/student-course-stats/types/student-course-stats.type';
import { mapList } from 'src/infrastructure/supabase/common/mapper.util';

function statsRowToDomain(row: SupabaseStudentCourseStats): StudentCourseStats {
  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    attemptedQuestions: Number(row.attempted_questions),
    correctAnswers: Number(row.correct_answers),
    lastAttemptAt: row.last_attempt_at,
  };
}

function courseStatWithStudentRowToDomain(row: SupabaseStudentCourseStatsWithStudent): StudentCourseStatsWithStudent {
  return {
    studentId: row.student_id,
    attemptedQuestions: row.attempted_questions,
    correctAnswers: row.correct_answers,
    lastAttemptAt: row.last_attempt_at,
    student: {
      id: row.students.id,
      name: row.students.name,
      email: row.students.email,
      photoUrl: row.students.photo_url,
      supabaseUserId: row.students.supabase_user_id,
    },
  };
}

export const StudentCourseStatsMapper = {
  toDomain: statsRowToDomain,

  courseStatWithStudentToDomain: courseStatWithStudentRowToDomain,

  listFromQuery(rawRows: unknown): StudentCourseStats[] {
    const rows = Array.isArray(rawRows) ? rawRows : [];
    return mapList(rows as SupabaseStudentCourseStats[], statsRowToDomain);
  },

  listCourseStatsWithStudentFromQuery(rawRows: unknown): StudentCourseStatsWithStudent[] {
    const rows = Array.isArray(rawRows) ? rawRows : [];
    return mapList(rows as SupabaseStudentCourseStatsWithStudent[], courseStatWithStudentRowToDomain);
  },
  toInsert: (body: insertStudentCourseStats): supabaseInsertStudentCourseStats => ({
    course_id: body.courseId,
    student_id: body.studentId,
    attempted_questions: body.attemptedQuestions,
    correct_answers: body.correctAnswers,
    last_attempt_at: body.lastAttemptAt,
  }),

  toUpdate: (body: UpdateStudentCourseStats): supabaseUpdateStudentCourseStats => ({
    attempted_questions: body.attemptedQuestions,
    correct_answers: body.correctAnswers,
    last_attempt_at: new Date().toISOString(),
  }),
};
