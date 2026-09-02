import { validate } from 'class-validator';
import { SendInvitationBodyDto } from './send-invitation-body.dto';

describe('SendInvitationBodyDto', () => {
  const valid = () =>
    Object.assign(new SendInvitationBodyDto(), {
      invitedEmail: 'prof@school.com',
      establishmentName: 'Edesio Academy',
      invitationToken: 'tok-1',
      assignedChatbots: 3,
    });

  it('accepts a valid body', async () => {
    expect(await validate(valid())).toHaveLength(0);
  });

  it('accepts optional locale en', async () => {
    const dto = Object.assign(valid(), { locale: 'en' });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects unsupported locale values', async () => {
    const dto = Object.assign(valid(), { locale: 'es' as never });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'locale')).toBe(true);
  });

  it('rejects invalid email', async () => {
    const dto = Object.assign(valid(), { invitedEmail: 'not-an-email' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'invitedEmail')).toBe(true);
  });
});
