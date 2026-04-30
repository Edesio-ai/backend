export type EvaluateAnswerResponse = {
  score: number;
  feedback: string;
  concepts: { name: string; score: number }[];
  missingElements: string[];
  suggestedAction: string | null;
  actionPrompt: string | null;
  correctAnswer?: string;
};
