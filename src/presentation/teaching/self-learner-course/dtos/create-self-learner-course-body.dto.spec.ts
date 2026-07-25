import { validate } from 'class-validator';
import { CreateSelfLearnerCourseBodyDto } from './create-self-learner-course-body.dto';

describe('CreateSelfLearnerCourseBodyDto', () => {
  const valid = () =>
    Object.assign(new CreateSelfLearnerCourseBodyDto(), {
      title: 'Mon titre',
      description: 'Une description',
      contentText: 'Contenu brut',
      language: 'francais',
    });

  it('accepts a valid body', async () => {
    expect(await validate(valid())).toHaveLength(0);
  });

  it('accepts optional description and contentText omitted', async () => {
    const dto = Object.assign(new CreateSelfLearnerCourseBodyDto(), {
      title: 'Sans optionnels',
      language: 'anglais',
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

  it('rejects empty title', async () => {
    const dto = Object.assign(valid(), { title: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });
});
