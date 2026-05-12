import { validate } from 'class-validator';
import { SendCourseQuestionBodyDto } from './send-course-question-body.dto';

describe('SendCourseQuestionBodyDto', () => {
  it('accepts a valid body', async () => {
    const dto = Object.assign(new SendCourseQuestionBodyDto(), {
      questionText: 'Pourquoi ?',
      courseId: 'course-1',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects empty questionText', async () => {
    const dto = Object.assign(new SendCourseQuestionBodyDto(), {
      questionText: '',
      courseId: 'course-1',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'questionText')).toBe(true);
  });

  it('rejects empty courseId', async () => {
    const dto = Object.assign(new SendCourseQuestionBodyDto(), {
      questionText: 'Question',
      courseId: '',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'courseId')).toBe(true);
  });
});
