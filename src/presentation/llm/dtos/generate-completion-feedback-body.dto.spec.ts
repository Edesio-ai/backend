import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GenerateCompletionFeedbackBodyDto } from './generate-completion-feedback-body.dto';

describe('GenerateCompletionFeedbackBodyDto', () => {
  const validPayload = () => ({
    courseId: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'Histoire',
    score: 8,
    total: 10,
    studentName: 'Alex',
    language: 'francais' as const,
    answers: [
      {
        questionText: 'Quelles sont les causes ?',
        score: 0.5,
        studentAnswer: 'Les inégalités',
        missingElements: ['crise financière'],
        concepts: [{ name: 'inégalités', score: 1 }],
      },
    ],
  });

  it('accepts a valid body', async () => {
    const dto = plainToInstance(GenerateCompletionFeedbackBodyDto, validPayload());
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts optional studentName and language omitted', async () => {
    const { studentName: _studentName, language: _language, ...rest } = validPayload();
    const dto = plainToInstance(GenerateCompletionFeedbackBodyDto, rest);

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects unsupported language values', async () => {
    const dto = plainToInstance(GenerateCompletionFeedbackBodyDto, {
      ...validPayload(),
      language: 'latin',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'language')).toBe(true);
  });

  it('rejects empty courseTitle', async () => {
    const dto = plainToInstance(GenerateCompletionFeedbackBodyDto, {
      ...validPayload(),
      courseTitle: '',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'courseTitle')).toBe(true);
  });

  it('rejects missing answers', async () => {
    const { answers: _answers, ...rest } = validPayload();
    const dto = plainToInstance(GenerateCompletionFeedbackBodyDto, rest);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'answers')).toBe(true);
  });
});
