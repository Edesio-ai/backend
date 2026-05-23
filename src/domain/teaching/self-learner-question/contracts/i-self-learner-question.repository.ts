export const SELF_LEARNER_QUESTION_REPOSITORY = Symbol(
  'SELF_LEARNER_QUESTION_REPOSITORY',
);

export interface ISelfLearnerQuestionRepository {
  deleteSelfLearnerQuestionsByCourseId(courseId: string): Promise<void>;
}
