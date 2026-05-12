import {
  CourseQuestion,
  CourseQuestionToInsert,
  SupabaseCourseQuestion,
  SupabaseCourseQuestionToInsert,
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

  toInsert: (
    courseQuestion: CourseQuestionToInsert,
  ): SupabaseCourseQuestionToInsert => ({
    course_id: courseQuestion.courseId,
    student_id: courseQuestion.studentId,
    question_text: courseQuestion.questionText,
  }),
};
