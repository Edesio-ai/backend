import { validate } from 'class-validator';
import { UpdatePasswordBodyDto } from './update-password-body.dto';

describe('UpdatePasswordBodyDto', () => {
  const validPassword = 'SecurePass12!Extra';

  it('accepts a valid password', async () => {
    const dto = Object.assign(new UpdatePasswordBodyDto(), {
      password: validPassword,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects password shorter than 12 characters', async () => {
    const dto = Object.assign(new UpdatePasswordBodyDto(), {
      password: 'Short1!',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects password without lowercase letter', async () => {
    const dto = Object.assign(new UpdatePasswordBodyDto(), {
      password: 'ALLUPPERCASE12!',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects password without uppercase letter', async () => {
    const dto = Object.assign(new UpdatePasswordBodyDto(), {
      password: 'alllowercase12!',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects password without digit', async () => {
    const dto = Object.assign(new UpdatePasswordBodyDto(), {
      password: 'NoDigitsHere!!',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects password without special character', async () => {
    const dto = Object.assign(new UpdatePasswordBodyDto(), {
      password: 'NoSpecialChar12',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects empty password', async () => {
    const dto = Object.assign(new UpdatePasswordBodyDto(), {
      password: '',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
