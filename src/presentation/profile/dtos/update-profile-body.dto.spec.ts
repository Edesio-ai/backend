import { validate } from 'class-validator';
import { UpdateProfileBodyDto } from './update-profile-body.dto';

describe('UpdateProfileBodyDto', () => {
  it('accepts a valid body', async () => {
    const dto = Object.assign(new UpdateProfileBodyDto(), {
      firstname: 'Ann',
      lastname: 'Other',
      email: 'ann@school.com',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid email', async () => {
    const dto = Object.assign(new UpdateProfileBodyDto(), {
      firstname: 'Ann',
      lastname: 'Other',
      email: 'not-an-email',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects empty firstname', async () => {
    const dto = Object.assign(new UpdateProfileBodyDto(), {
      firstname: '',
      lastname: 'Other',
      email: 'ann@school.com',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'firstname')).toBe(true);
  });
});
