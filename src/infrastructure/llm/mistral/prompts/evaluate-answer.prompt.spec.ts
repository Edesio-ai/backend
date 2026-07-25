import { getEvaluateAnswerSystemPrompt, getEvaluateAnswerUserPrompt } from './evaluate-answer.prompt';
import { EvaluateAnswerBody } from 'src/application/llm/evaluate-answer.use-case';

describe('evaluate-answer.prompt', () => {
  const body: EvaluateAnswerBody = {
    questionText: 'Quelles sont les causes de la Révolution française ?',
    correctAnswer: 'Crise financière, inégalités sociales, influence des Lumières',
    answer: "L'argent et les inégalités",
    explanation: 'La Révolution française a été causée par plusieurs facteurs.',
  };

  describe('getEvaluateAnswerSystemPrompt', () => {
    it('should return a non-empty string', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt.trim().length).toBeGreaterThan(0);
    });

    it('should include evaluation scoring instructions', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('score');
    });

    it('should include feedback instructions', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('feedback');
    });

    it('should include suggestedAction field definition', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('suggestedAction');
    });

    it('should include actionPrompt field definition', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('actionPrompt');
    });

    it('should include missingElements field definition', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('missingElements');
    });

    it('should include concepts field definition', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('concepts');
    });

    it('should define action thresholds A and B', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('"A"');
      expect(prompt).toContain('"B"');
    });

    it('should describe the score range from 0 to 1', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('0');
      expect(prompt).toContain('1');
    });

    it('should specify JSON-only response format', () => {
      const prompt = getEvaluateAnswerSystemPrompt();
      expect(prompt).toContain('JSON');
    });
  });

  describe('getEvaluateAnswerUserPrompt', () => {
    it('should include the question text', () => {
      const prompt = getEvaluateAnswerUserPrompt(body);
      expect(prompt).toContain(body.questionText);
    });

    it('should include the correct answer', () => {
      const prompt = getEvaluateAnswerUserPrompt(body);
      expect(prompt).toContain(body.correctAnswer);
    });

    it('should include the student answer', () => {
      const prompt = getEvaluateAnswerUserPrompt(body);
      expect(prompt).toContain(body.answer);
    });

    it('should include the explanation when provided', () => {
      const prompt = getEvaluateAnswerUserPrompt(body);
      expect(prompt).toContain(body.explanation);
    });

    it('should not include explanation section when explanation is empty', () => {
      const promptWithoutExplanation = getEvaluateAnswerUserPrompt({
        ...body,
        explanation: '',
      });
      expect(promptWithoutExplanation).not.toContain('CONTEXTE DU COURS');
    });

    it('should include explanation section label when explanation is provided', () => {
      const prompt = getEvaluateAnswerUserPrompt(body);
      expect(prompt).toContain('CONTEXTE DU COURS');
    });

    it('should label the correct answer section', () => {
      const prompt = getEvaluateAnswerUserPrompt(body);
      expect(prompt).toContain('RÉPONSE ATTENDUE');
    });

    it('should label the student answer section', () => {
      const prompt = getEvaluateAnswerUserPrompt(body);
      expect(prompt).toContain("RÉPONSE DE L'ÉLÈVE");
    });

    it('should label the question section', () => {
      const prompt = getEvaluateAnswerUserPrompt(body);
      expect(prompt).toContain('QUESTION');
    });
  });
});
