import {
  CourseQuestion,
  SupabaseCourseQuestion,
} from 'src/domain/teaching/course-question/types/course-question.type';

export const CourseQuestionMapper = {
  toDomain: (row: SupabaseCourseQuestion): CourseQuestion => ({
    id: row.id,
    courseId: row.course_id,
    studentId: row.student_id,
    questionText: row.question_text,
    answer: row.answer,
    createdAt: row.created_at,
    answeredAt: row.answered_at,
  }),
};
