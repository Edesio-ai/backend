import {
  Course,
  CreateCourseBody,
  SupabaseCourse,
  SupabaseCourseInsert,
} from 'src/domain/teaching/course/types/course.type';

export const CourseMapper = {
  toDomain: (row: SupabaseCourse): Course => ({
    id: row.id,
    sessionId: row.session_id,
    title: row.title,
    description: row.description,
    contentText: row.text_content,
    validatedQuestions: row.validated_questions,
    positionOrder: row.position_order,
    createdAt: row.created_at,
  }),

  toInsert: (body: CreateCourseBody): SupabaseCourseInsert => ({
    session_id: body.sessionId,
    title: body.title,
    description: body.description,
    text_content: body.contentText,
  }),

  toUpdate: (updates: Record<string, unknown>): Record<string, unknown> => {
    const row: Record<string, unknown> = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.contentText !== undefined) row.text_content = updates.contentText;
    if (updates.positionOrder !== undefined) row.position_order = updates.positionOrder;
    if (updates.validatedQuestions !== undefined) row.validated_questions = updates.validatedQuestions;
    return row;
  },

  validatedQuestionsToDomain: (data: { validated_questions: boolean }): { validatedQuestions: boolean } => ({
    validatedQuestions: data.validated_questions,
  }),
};
