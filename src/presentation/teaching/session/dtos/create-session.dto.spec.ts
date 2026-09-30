import { validate } from 'class-validator';
import { CreateSessionBodyDto } from './create-session.dto';

describe('CreateSessionBodyDto', () => {
  it('accepts name, code and language without teacherId', async () => {
    const dto = Object.assign(new CreateSessionBodyDto(), {
      name: 'Session A',
      code: 'ABC123',
      language: 'francais',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects missing required fields', async () => {
    const dto = Object.assign(new CreateSessionBodyDto(), {});

    const errors = await validate(dto);
    const properties = errors.map((e) => e.property);

    expect(properties).toEqual(expect.arrayContaining(['name', 'code', 'language']));
  });

  it('rejects empty name', async () => {
    const dto = Object.assign(new CreateSessionBodyDto(), {
      name: '',
      code: 'ABC123',
      language: 'francais',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });
});
