import {
  GeneratedQuestion,
  QuestionGenerationConfig,
} from 'src/domain/teaching/types/question.type';
import { EvaluateAnswerBody } from 'src/application/llm/evaluate-answer.use-case';
import { EvaluateAnswerResponse } from 'src/domain/shared/llm/types/openai.type';
import { GenerateCompletionFeedbackBodyDto } from 'src/presentation/llm/dtos/generate-completion-feedback-body.dto';

export const OPENAI_REPOSITORY = Symbol('OPENAI_REPOSITORY');

export interface OpenaiRepository {
  generateQuestions(
    courseContent: string,
    config: QuestionGenerationConfig,
    existingQuestions?: string[],
  ): Promise<GeneratedQuestion[]>;
  evaluateAnswer(body: EvaluateAnswerBody): Promise<EvaluateAnswerResponse>;
  generateCompletionFeedback(
    body: GenerateCompletionFeedbackBodyDto,
  ): Promise<string>;
}
