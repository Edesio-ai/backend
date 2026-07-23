import {
  getGenerateCompletionFeedbackSystemPrompt,
  getGenerateCompletionFeedbackUserPrompt,
} from './generate-completion-feedback.prompt';
import { GenerateCompletionFeedbackBody } from 'src/application/llm/generate-completion-feedback.use-case';

describe('generate-completion-feedback.prompt', () => {
  const body: GenerateCompletionFeedbackBody = {
    total: 10,
    score: 7,
    courseTitle: 'Mathématiques',
    studentName: 'Sam',
    language: 'francais',
  };

  describe('getGenerateCompletionFeedbackSystemPrompt', () => {
    it('should describe a benevolent teacher role', () => {
      const prompt = getGenerateCompletionFeedbackSystemPrompt('francais');
      expect(prompt).toContain('professeur');
      expect(prompt).toContain('français');
    });

    it('should require English when course language is anglais', () => {
      const prompt = getGenerateCompletionFeedbackSystemPrompt('anglais');
      expect(prompt).toContain('anglais');
    });

    it('should enforce short length and course subject mention', () => {
      const prompt = getGenerateCompletionFeedbackSystemPrompt();
      expect(prompt).toMatch(/2-3 phrases/i);
      expect(prompt).toContain('cours');
    });
  });

  describe('getGenerateCompletionFeedbackUserPrompt', () => {
    it('should include student name, course, score and percent', () => {
      const prompt = getGenerateCompletionFeedbackUserPrompt(
        body,
        'Contexte pédagogique.',
        70,
      );
      expect(prompt).toContain('Sam');
      expect(prompt).toContain('Mathématiques');
      expect(prompt).toContain('7/10');
      expect(prompt).toContain('70%');
    });

    it('should use anonymous label when studentName is empty', () => {
      const prompt = getGenerateCompletionFeedbackUserPrompt(
        { ...body, studentName: '' },
        'Contexte.',
        0,
      );
      expect(prompt).toContain('Élève anonyme');
    });

    it('should include the feedback context text', () => {
      const ctx = 'Encourager sans décourager.';
      const prompt = getGenerateCompletionFeedbackUserPrompt(body, ctx, 45);
      expect(prompt).toContain(ctx);
    });

    it('should mention the course language', () => {
      const prompt = getGenerateCompletionFeedbackUserPrompt(
        { ...body, language: 'anglais' },
        'Contexte.',
        80,
      );
      expect(prompt).toContain('anglais');
    });
  });
});
