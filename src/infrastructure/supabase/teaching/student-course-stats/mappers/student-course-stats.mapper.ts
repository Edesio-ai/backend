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
    },
  };
}

export const StudentCourseStatsMapper = {
  toDomain: (row: SupabaseStudentCourseStats): StudentCourseStats => ({
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    attemptedQuestions: row.attempted_questions,
    correctAnswers: row.correct_answers,
    lastAttemptAt: row.last_attempt_at,
  }),

  courseStatWithStudentToDomain: courseStatWithStudentRowToDomain,

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
