import { GeneratedQuestion, QuestionGenerationConfig } from 'src/domain/llm/types/openai.type';
import { EvaluateAnswerBody } from 'src/application/llm/evaluate-answer.use-case';
import { EvaluateAnswerResponse, LlmCompletionFeedbackResult } from 'src/domain/llm/types/openai.type';
import { GenerateCompletionFeedbackLlmInput } from 'src/application/llm/generate-completion-feedback.use-case';

export const LLM_REPOSITORY = Symbol('LLM_REPOSITORY');

export interface ILlmProvider {
  generateQuestions(
    courseContent: string,
    config: QuestionGenerationConfig,
    existingQuestions?: string[],
  ): Promise<GeneratedQuestion[]>;
  evaluateAnswer(body: EvaluateAnswerBody): Promise<EvaluateAnswerResponse>;
  generateCompletionFeedback(body: GenerateCompletionFeedbackLlmInput): Promise<LlmCompletionFeedbackResult>;
}
