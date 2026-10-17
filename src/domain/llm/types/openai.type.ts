import { QuestionType } from 'src/domain/teaching/question/types/question.type';
import { Language } from 'src/domain/teaching/session/types/session.type';

export type EvaluateAnswerResponse = {
  score: number;
  feedback: string;
  concepts: { name: string; score: number }[];
  missingElements: string[];
  suggestedAction: string | null;
  actionPrompt: string | null;
  correctAnswer?: string;
  isCheating?: boolean;
};

export type CompletionFeedbackResponse = {
  feedback: string;
  score: number;
  total: number;
  notionsToReview: string[];
};

export type LlmCompletionFeedbackResult = {
  feedback: string;
  notionsToReview: string[];
};

export type QuestionGenerationConfig = {
  totalQuestions?: number;
  singleCount?: number;
  openedCount?: number;
  language: Language;
};

export type GeneratedQuestion = {
  type: QuestionType;
  questionText: string;
  keyConcepts: string[];
  proposals: string[];
  correctAnswers: string[];
  explanation: string;
};
