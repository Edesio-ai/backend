import {
  getGenerateCompletionFeedbackSystemPrompt,
  getGenerateCompletionFeedbackUserPrompt,
} from './generate-completion-feedback.prompt';
import { GenerateCompletionFeedbackLlmInput } from 'src/application/llm/generate-completion-feedback.use-case';

describe('generate-completion-feedback.prompt', () => {
  const body: GenerateCompletionFeedbackLlmInput = {
    total: 10,
    score: 7,
    courseTitle: 'Mathématiques',
    courseContent: 'Chapitre 1 : Fractions\nChapitre 2 : Pourcentages',
    studentName: 'Sam',
    language: 'francais',
    answers: [
      {
        questionText: "Qu'est-ce qu'une fraction ?",
        score: 0.3,
        studentAnswer: 'Un nombre',
        missingElements: ['numérateur', 'dénominateur'],
        concepts: [{ name: 'fraction', score: 0.3 }],
      },
    ],
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

    it('should require JSON with feedback and notionsToReview', () => {
      const prompt = getGenerateCompletionFeedbackSystemPrompt();
      expect(prompt).toMatch(/2-3 phrases/i);
      expect(prompt).toContain('notionsToReview');
      expect(prompt).toContain('"feedback"');
      expect(prompt).toContain('CONTENU DU COURS');
    });

    it('should require notions unless the quiz is perfect at 100%', () => {
      const prompt = getGenerateCompletionFeedbackSystemPrompt();
      expect(prompt).toContain('DOIT contenir 1 à 5 notions');
      expect(prompt).toContain('parfait à 100%');
    });
  });

  describe('getGenerateCompletionFeedbackUserPrompt', () => {
    it('should include student name, course, score and percent', () => {
      const prompt = getGenerateCompletionFeedbackUserPrompt(body, 'Contexte pédagogique.', 70);
      expect(prompt).toContain('Sam');
      expect(prompt).toContain('Mathématiques');
      expect(prompt).toContain('7/10');
      expect(prompt).toContain('70%');
    });

    it('should include course content and quiz answers', () => {
      const prompt = getGenerateCompletionFeedbackUserPrompt(body, 'Contexte.', 70);
      expect(prompt).toContain('Chapitre 1 : Fractions');
      expect(prompt).toContain("Qu'est-ce qu'une fraction ?");
      expect(prompt).toContain('numérateur');
    });

    it('should mark imperfect answers and require notionsToReview when not 100%', () => {
      const prompt = getGenerateCompletionFeedbackUserPrompt(body, 'Contexte.', 30);
      expect(prompt).toContain('[IMPARFAIT]');
      expect(prompt).toContain('Tu DOIS remplir "notionsToReview"');
    });

    it('should allow empty notionsToReview only at 100%', () => {
      const perfectBody: GenerateCompletionFeedbackLlmInput = {
        ...body,
        score: 10,
        total: 10,
        answers: [{ questionText: 'Q?', score: 1 }],
      };
      const prompt = getGenerateCompletionFeedbackUserPrompt(perfectBody, 'Contexte.', 100);
      expect(prompt).toContain('Quiz parfait à 100%');
      expect(prompt).toContain('peut être []');
    });

    it('should use anonymous label when studentName is empty', () => {
      const prompt = getGenerateCompletionFeedbackUserPrompt({ ...body, studentName: '' }, 'Contexte.', 0);
      expect(prompt).toContain('Élève anonyme');
    });

    it('should include the feedback context text', () => {
      const ctx = 'Encourager sans décourager.';
      const prompt = getGenerateCompletionFeedbackUserPrompt(body, ctx, 45);
      expect(prompt).toContain(ctx);
    });

    it('should mention the course language', () => {
      const prompt = getGenerateCompletionFeedbackUserPrompt({ ...body, language: 'anglais' }, 'Contexte.', 80);
      expect(prompt).toContain('anglais');
    });
  });
});
