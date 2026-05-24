import {
  SelfLearnerQuestion,
  SelfLearnerQuestionSupabase,
} from 'src/domain/teaching/self-learner-question/types/self-learner-question.type';

export const selfLearnerQuestionMapper = {
  toDomain: (data: SelfLearnerQuestionSupabase): SelfLearnerQuestion => {
    return {
      id: data.id,
      courseId: data.course_id,
      type: data.type,
      questionText: data.question_text,
      proposals: data.proposals,
      correctAnswer: data.correct_answer,
      explanation: data.explanation,
      createdAt: data.created_at,
    };
  },
};
