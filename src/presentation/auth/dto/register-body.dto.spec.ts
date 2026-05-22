import { validate } from 'class-validator';
import { RegisterBody } from './register-body.dto';

describe('RegisterBody', () => {
  const validPassword = 'SecurePass12!Extra';

  const valid = () =>
    Object.assign(new RegisterBody(), {
      role: 'self-learner' as const,
      email: 'user@school.com',
      password: validPassword,
      firstname: 'Alex',
      lastname: 'Dupont',
      acceptTerms: true,
    });

  it('accepts a valid self-learner registration body', async () => {
    const errors = await validate(valid());

    expect(errors).toHaveLength(0);
  });

  it('accepts teacher role', async () => {
    const dto = Object.assign(valid(), { role: 'teacher' as const });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects unsupported role values', async () => {
    const dto = Object.assign(valid(), { role: 'admin' as any });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('rejects weak or short passwords', async () => {
    const dto = Object.assign(valid(), { password: 'weak' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('requires acceptTerms to be explicitly true', async () => {
    const dto = Object.assign(valid(), { acceptTerms: false });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'acceptTerms')).toBe(true);
  });

  it('rejects invalid email', async () => {
    const dto = Object.assign(valid(), { email: 'not-valid' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
