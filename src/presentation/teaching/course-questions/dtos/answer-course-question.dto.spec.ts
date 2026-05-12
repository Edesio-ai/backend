import { validate } from 'class-validator';
import { AnswerCourseQuestionBodyDto } from './answer-course-question.dto';

const validCourseQuestionId = '550e8400-e29b-41d4-a716-446655440001';

describe('AnswerCourseQuestionBodyDto', () => {
  it('accepts a valid body', async () => {
    const dto = Object.assign(new AnswerCourseQuestionBodyDto(), {
      courseQuestionId: validCourseQuestionId,
      answer: 'Ma réponse.',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects empty answer', async () => {
    const dto = Object.assign(new AnswerCourseQuestionBodyDto(), {
      courseQuestionId: validCourseQuestionId,
      answer: '',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'answer')).toBe(true);
  });

  it('rejects invalid courseQuestionId', async () => {
    const dto = Object.assign(new AnswerCourseQuestionBodyDto(), {
      courseQuestionId: 'not-a-uuid',
      answer: 'Réponse',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'courseQuestionId')).toBe(true);
  });
});
