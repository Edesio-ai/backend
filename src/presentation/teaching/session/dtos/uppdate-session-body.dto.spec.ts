import { validate } from 'class-validator';
import { UpdateSessionBodyDto } from './uppdate-session-body.dto';

describe('UpdateSessionBodyDto', () => {
  it('accepts a non-empty name', async () => {
    const dto = Object.assign(new UpdateSessionBodyDto(), {
      name: 'Session renommée',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects missing name', async () => {
    const dto = Object.assign(new UpdateSessionBodyDto(), {});

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects empty name', async () => {
    const dto = Object.assign(new UpdateSessionBodyDto(), {
      name: '',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });
});
