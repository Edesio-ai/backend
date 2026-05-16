import { GetCustomerPortalUrlUseCase } from './get-custome-portal-url.use-case';
import { User } from '../../domain/auth/types/auth.type';
import { IStripeProvider } from '../../domain/billing/contracts/i-stripe-client.provider';
import { createMockStripeProvider } from 'src/testing/mock-stripe-provider';

describe('GetCustomerPortalUrlUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return portal URL from stripe for user email', async () => {
    fixtures.whenStripeReturnsPortalUrl();

    const result = await fixtures.whenExecute();

    fixtures.thenGetCustomerPortalUrlCalledWith(fixtures.user.email);
    fixtures.thenReturnsPortalUrl(result);
  });

  it('should return null when stripe returns null', async () => {
    fixtures.whenStripeReturnsNull();

    const result = await fixtures.whenExecute();

    fixtures.thenReturnsNull(result);
    fixtures.thenGetCustomerPortalUrlCalledWith(fixtures.user.email);
  });

  it('should propagate stripe error', async () => {
    fixtures.whenStripeThrows();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowStripeError(promise);
    fixtures.thenGetCustomerPortalUrlCalledWith(fixtures.user.email);
  });
});

class Fixtures {
  public readonly stripeRepository: jest.Mocked<IStripeProvider>;
  public readonly useCase: GetCustomerPortalUrlUseCase;

  public readonly user: User;
  public readonly portalUrl: string;
  public readonly stripeError: Error;

  constructor() {
    this.stripeRepository = createMockStripeProvider();

    this.useCase = new GetCustomerPortalUrlUseCase(this.stripeRepository);

    this.user = {
      id: 'u-1',
      email: 'billing@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'establishment', firstname: 'Sam' },
    };

    this.portalUrl = 'https://billing.stripe.com/session/test';
    this.stripeError = new Error('portal unavailable');
  }

  whenExecute() {
    return this.useCase.execute(this.user);
  }

  whenStripeReturnsPortalUrl() {
    this.stripeRepository.getCustomerPortalUrl.mockResolvedValue(
      this.portalUrl,
    );
  }

  whenStripeReturnsNull() {
    this.stripeRepository.getCustomerPortalUrl.mockResolvedValue(null);
  }

  whenStripeThrows() {
    this.stripeRepository.getCustomerPortalUrl.mockRejectedValue(
      this.stripeError,
    );
  }

  thenGetCustomerPortalUrlCalledWith(email: string) {
    expect(this.stripeRepository.getCustomerPortalUrl).toHaveBeenCalledWith(
      email,
    );
    expect(this.stripeRepository.getCustomerPortalUrl).toHaveBeenCalledTimes(1);
  }

  thenReturnsPortalUrl(result: string | null) {
    expect(result).toBe(this.portalUrl);
  }

  thenReturnsNull(result: string | null) {
    expect(result).toBeNull();
  }

  async thenThrowStripeError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.stripeError);
  }
}
