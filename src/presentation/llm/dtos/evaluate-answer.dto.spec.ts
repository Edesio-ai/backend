import { validate } from 'class-validator';
import { EvaluateAnswerDto } from './evaluate-answer.dto';

describe('EvaluateAnswerDto', () => {
  const valid = () =>
    Object.assign(new EvaluateAnswerDto(), {
      questionText: 'What causes the French Revolution?',
      correctAnswer: 'Financial crisis, social inequalities',
      answer: 'Inequalities',
      explanation: 'Several factors caused the revolution.',
      language: 'anglais',
    });

  it('accepts a valid body', async () => {
    expect(await validate(valid())).toHaveLength(0);
  });

  it('accepts optional language omitted', async () => {
    const dto = Object.assign(new EvaluateAnswerDto(), {
      questionText: 'Quelles sont les causes de la Révolution française ?',
      correctAnswer: 'Crise financière',
      answer: 'Les inégalités',
      explanation: 'Plusieurs facteurs.',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects unsupported language values', async () => {
    const dto = Object.assign(valid(), {
      language: 'latin' as unknown as 'fr',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'language')).toBe(true);
  });

  it('rejects empty questionText', async () => {
    const dto = Object.assign(valid(), { questionText: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'questionText')).toBe(true);
  });
});
