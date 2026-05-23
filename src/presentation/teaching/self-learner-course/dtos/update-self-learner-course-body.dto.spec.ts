import { validate } from 'class-validator';
import { UpdateSelfLearnerCourseBodyDto } from './update-self-learner-course-body.dto';

describe('UpdateSelfLearnerCourseBodyDto', () => {
  it('accepts empty object (all fields optional)', async () => {
    const dto = Object.assign(new UpdateSelfLearnerCourseBodyDto(), {});

    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts partial string updates', async () => {
    const dto = Object.assign(new UpdateSelfLearnerCourseBodyDto(), {
      title: 'Updated',
      contentText: 'Some text',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects title when present but not a string', async () => {
    const dto = Object.assign(new UpdateSelfLearnerCourseBodyDto(), {
      title: 123 as unknown as string,
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });
});
