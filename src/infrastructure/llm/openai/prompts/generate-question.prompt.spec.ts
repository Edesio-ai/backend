import {
  getGenerateQuestionSystemPrompt,
  getGenerateQuestionUserPrompt,
} from './generate-question.prompt';
import { QuestionGenerationConfig } from 'src/domain/teaching/types/question.type';

describe('generate-question.prompt', () => {
  const config: QuestionGenerationConfig = {
    totalQuestions: 6,
    multipleChoiceCount: 4,
    openedCount: 2,
    language: 'francais',
  };

  describe('getGenerateQuestionSystemPrompt', () => {
    it('should include totalQuestions in the system prompt', () => {
      const prompt = getGenerateQuestionSystemPrompt(config);
      expect(prompt).toContain('6');
    });

    it('should include the language in the system prompt', () => {
      const prompt = getGenerateQuestionSystemPrompt(config);
      expect(prompt).toContain('francais');
    });

    it('should return a non-empty string', () => {
      const prompt = getGenerateQuestionSystemPrompt(config);
      expect(prompt.trim().length).toBeGreaterThan(0);
    });
  });

  describe('getGenerateQuestionUserPrompt', () => {
    const courseContent = 'Contenu pédagogique du cours';
    const existingContext = '';

    it('should include totalQuestions in the user prompt', () => {
      const prompt = getGenerateQuestionUserPrompt(
        config,
        courseContent,
        existingContext,
      );
      expect(prompt).toContain('6');
    });

    it('should include multipleChoiceCount in the user prompt', () => {
      const prompt = getGenerateQuestionUserPrompt(
        config,
        courseContent,
        existingContext,
      );
      expect(prompt).toContain('4');
    });

    it('should include openedCount in the user prompt', () => {
      const prompt = getGenerateQuestionUserPrompt(
        config,
        courseContent,
        existingContext,
      );
      expect(prompt).toContain('2');
    });

    it('should include the course content', () => {
      const prompt = getGenerateQuestionUserPrompt(
        config,
        courseContent,
        existingContext,
      );
      expect(prompt).toContain(courseContent);
    });

    it('should include the language', () => {
      const prompt = getGenerateQuestionUserPrompt(
        config,
        courseContent,
        existingContext,
      );
      expect(prompt).toContain('francais');
    });

    it('should include existing questions context when provided', () => {
      const context = 'QUESTIONS DÉJÀ EXISTANTES';
      const prompt = getGenerateQuestionUserPrompt(
        config,
        courseContent,
        context,
      );
      expect(prompt).toContain(context);
    });

    it('should specify the expected JSON structure with correct field names', () => {
      const prompt = getGenerateQuestionUserPrompt(
        config,
        courseContent,
        existingContext,
      );
      expect(prompt).toContain('questionText');
      expect(prompt).toContain('proposals');
      expect(prompt).toContain('correctAnswers');
      expect(prompt).toContain('explanation');
    });

    it('should specify both question types in the JSON schema', () => {
      const prompt = getGenerateQuestionUserPrompt(
        config,
        courseContent,
        existingContext,
      );
      expect(prompt).toContain('"multiple"');
      expect(prompt).toContain('"open"');
    });
  });
});
