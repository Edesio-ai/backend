import {
  GeneratedQuestion,
  QuestionGenerationConfig,
} from 'src/domain/teaching/types/question.type';

export const OPENAI_REPOSITORY = Symbol('OPENAI_REPOSITORY');

export interface OpenaiRepository {
  generateQuestions(
    courseContent: string,
    config: QuestionGenerationConfig,
    existingQuestions?: string[],
  ): Promise<GeneratedQuestion[]>;
}
