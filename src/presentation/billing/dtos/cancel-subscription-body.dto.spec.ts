import { validate } from 'class-validator';
import { CancelSubscriptionBodyDto } from './cancel-subscription-body.dto';

describe('CancelSubscriptionBodyDto', () => {
  it('accepts an empty body', async () => {
    expect(await validate(new CancelSubscriptionBodyDto())).toHaveLength(0);
  });

  it('accepts locale en', async () => {
    const dto = Object.assign(new CancelSubscriptionBodyDto(), { locale: 'en' });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects unsupported locale values', async () => {
    const dto = Object.assign(new CancelSubscriptionBodyDto(), {
      locale: 'de' as never,
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'locale')).toBe(true);
  });
});
