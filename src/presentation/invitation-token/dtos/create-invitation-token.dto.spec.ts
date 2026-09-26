import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateInvitationTokenBodyDto } from './create-invitation-token.dto';

describe('CreateInvitationTokenBodyDto', () => {
  const valid = () =>
    Object.assign(new CreateInvitationTokenBodyDto(), {
      establishmentId: 'est-1',
      token: 'token-123',
      firstname: 'Camille',
      lastname: 'Bernard',
      invitedEmail: 'teacher@school.com',
      expiresAt: new Date('2026-12-31T12:00:00.000Z'),
      assignedChatbots: 3,
      locale: 'fr',
    });

  it('accepts a valid body', async () => {
    expect(await validate(valid())).toHaveLength(0);
  });

  it('rejects invalid email', async () => {
    const dto = Object.assign(valid(), { invitedEmail: 'not-an-email' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'invitedEmail')).toBe(true);
  });

  it('rejects empty token', async () => {
    const dto = Object.assign(valid(), { token: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'token')).toBe(true);
  });

  it('rejects non-date expiresAt', async () => {
    const dto = Object.assign(valid(), { expiresAt: 'not-a-date' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'expiresAt')).toBe(true);
  });

  it('rejects empty firstname', async () => {
    const dto = Object.assign(valid(), { firstname: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'firstname')).toBe(true);
  });

  it('rejects negative assignedChatbots', async () => {
    const dto = Object.assign(valid(), { assignedChatbots: -1 });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'assignedChatbots')).toBe(true);
  });

  it('rejects invalid locale', async () => {
    const dto = Object.assign(valid(), { locale: 'es' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'locale')).toBe(true);
  });
});
