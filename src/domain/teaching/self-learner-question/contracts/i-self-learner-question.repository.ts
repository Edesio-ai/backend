import { GeneratedQuestion } from 'src/domain/llm/types/openai.type';
import {
  SelfLearnerQuestion,
  SelfLearnerQuestionInsert,
} from '../types/self-learner-question.type';

export const SELF_LEARNER_QUESTION_REPOSITORY = Symbol(
  'SELF_LEARNER_QUESTION_REPOSITORY',
);

export interface ISelfLearnerQuestionRepository {
  deleteSelfLearnerQuestionsByCourseId(courseId: string): Promise<void>;
  getSelfLearnerQuestions(courseId: string): Promise<SelfLearnerQuestion[]>;
  insertSelfLearnerQuestions(
    questions: GeneratedQuestion[],
    courseId: string,
  ): Promise<SelfLearnerQuestion[]>;
  createSelfLearnerQuestion(
    payload: SelfLearnerQuestionInsert,
  ): Promise<SelfLearnerQuestion>;
}
