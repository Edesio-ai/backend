import { validate } from 'class-validator';
import { GenerateCompletionFeedbackBodyDto } from './generate-completion-feedback-body.dto';

describe('GenerateCompletionFeedbackBodyDto', () => {
  const valid = () =>
    Object.assign(new GenerateCompletionFeedbackBodyDto(), {
      courseTitle: 'Histoire',
      score: 8,
      total: 10,
      studentName: 'Alex',
      language: 'francais',
    });

  it('accepts a valid body', async () => {
    expect(await validate(valid())).toHaveLength(0);
  });

  it('accepts optional studentName and language omitted', async () => {
    const dto = Object.assign(new GenerateCompletionFeedbackBodyDto(), {
      courseTitle: 'Histoire',
      score: 8,
      total: 10,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects unsupported language values', async () => {
    const dto = Object.assign(valid(), { language: 'latin' as any });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'language')).toBe(true);
  });

  it('rejects empty courseTitle', async () => {
    const dto = Object.assign(valid(), { courseTitle: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'courseTitle')).toBe(true);
  });
});
