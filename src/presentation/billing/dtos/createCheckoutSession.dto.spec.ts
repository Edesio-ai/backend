import { validate } from 'class-validator';
import { CreateCheckoutSessionBodyDto } from './createCheckoutSession.dto';

describe('CreateCheckoutSessionBodyDto', () => {
  const valid = () =>
    Object.assign(new CreateCheckoutSessionBodyDto(), {
      priceId: 'price_123',
      planType: 'pro',
    });

  it('accepts a valid body', async () => {
    expect(await validate(valid())).toHaveLength(0);
  });

  it('accepts optional locale en', async () => {
    const dto = Object.assign(valid(), { locale: 'en' });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects unsupported locale values', async () => {
    const dto = Object.assign(valid(), { locale: 'de' as never });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'locale')).toBe(true);
  });

  it('rejects empty priceId', async () => {
    const dto = Object.assign(valid(), { priceId: '' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'priceId')).toBe(true);
  });
});
