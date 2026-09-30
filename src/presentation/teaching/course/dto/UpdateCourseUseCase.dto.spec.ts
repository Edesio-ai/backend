import { validate } from 'class-validator';
import { UpdateCourseBodyDto } from './UpdateCourseUseCase.dto';

describe('UpdateCourseBodyDto', () => {
  it('accepts an empty update body (partial update)', async () => {
    expect(await validate(new UpdateCourseBodyDto())).toHaveLength(0);
  });

  it('accepts a single field update', async () => {
    const dto = Object.assign(new UpdateCourseBodyDto(), {
      title: 'Nouveau titre',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts all optional fields', async () => {
    const dto = Object.assign(new UpdateCourseBodyDto(), {
      title: 'Titre',
      description: 'Desc',
      contentText: 'Contenu',
      positionOrder: 2,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts null for nullable string fields', async () => {
    const dto = Object.assign(new UpdateCourseBodyDto(), {
      description: null,
      contentText: null,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects non-string title', async () => {
    const dto = Object.assign(new UpdateCourseBodyDto(), {
      title: 123 as unknown as string,
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('rejects non-number positionOrder', async () => {
    const dto = Object.assign(new UpdateCourseBodyDto(), {
      positionOrder: '2' as unknown as number,
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'positionOrder')).toBe(true);
  });
});
