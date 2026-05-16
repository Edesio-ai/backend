import { CancelSubscriptionUseCase } from './cancel-subscription.use-case';
import { User } from '../../domain/auth/types/auth.type';
import { IStripeProvider } from '../../domain/billing/contracts/i-stripe-client.provider';
import { CancelSubscription } from '../../domain/billing/types/billing.type';
import { IEmailProvider } from '../../domain/email/contract/i-email.interface';

describe('CancelSubscriptionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should cancel subscription, send email and return stripe payload', async () => {
    fixtures.whenStripeCancelSucceeds();
    fixtures.whenSendCancelEmailResolves();

    const result = await fixtures.whenExecute();

    fixtures.thenCancelSubscriptionCalledWithUser();
    fixtures.thenSendCancelSubscriptionEmailCalledWithExpectedPayload();
    fixtures.thenReturnsCanceledPayload(result);
  });

  it('should propagate stripe error and not send email', async () => {
    fixtures.whenStripeCancelThrows();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowStripeError(promise);
    fixtures.thenCancelSubscriptionCalledWithUser();
    fixtures.thenSendCancelSubscriptionEmailNotCalled();
  });

  it('should propagate email error after cancel succeeds', async () => {
    fixtures.whenStripeCancelSucceeds();
    fixtures.whenSendCancelEmailThrows();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowEmailError(promise);
    fixtures.thenCancelSubscriptionCalledWithUser();
    fixtures.thenSendCancelSubscriptionEmailCalledWithExpectedPayload();
  });
});

class Fixtures {
  public readonly stripeRepository: jest.Mocked<IStripeProvider>;
  public readonly emailProvider: jest.Mocked<IEmailProvider>;
  public readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase;

  public readonly user: User;
  public readonly canceledSubscription: CancelSubscription;
  public readonly stripeError: Error;
  public readonly emailError: Error;

  constructor() {
    this.stripeRepository = {
      getUserSubscription: jest.fn(),
      getCustomerByEmail: jest.fn(),
      getCheckoutSessionByUserId: jest.fn(),
      getSubscriptionsByCustomerId: jest.fn(),
      createCheckoutSession: jest.fn(),
      getCheckoutSession: jest.fn(),
      cancelSubscription: jest.fn(),
    };

    this.emailProvider = {
      sendWelcomeEmail: jest.fn(),
      sendProfesseurInvitation: jest.fn(),
      sendCancelSubscriptionEmail: jest.fn(),
    };

    this.cancelSubscriptionUseCase = new CancelSubscriptionUseCase(
      this.stripeRepository,
      this.emailProvider,
    );

    this.user = {
      id: 'u-1',
      email: 'owner@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'establishment', firstname: 'Marc' },
    };

    this.canceledSubscription = {
      planName: 'Offre Pro',
      endDate: '10 mars 2026',
    };

    this.stripeError = new Error('stripe cancel failed');
    this.emailError = new Error('email send failed');
  }

  whenExecute() {
    return this.cancelSubscriptionUseCase.execute(this.user);
  }

  whenStripeCancelSucceeds() {
    this.stripeRepository.cancelSubscription.mockResolvedValue(
      this.canceledSubscription,
    );
  }

  whenStripeCancelThrows() {
    this.stripeRepository.cancelSubscription.mockRejectedValue(
      this.stripeError,
    );
  }

  whenSendCancelEmailResolves() {
    this.emailProvider.sendCancelSubscriptionEmail.mockResolvedValue(undefined);
  }

  whenSendCancelEmailThrows() {
    this.emailProvider.sendCancelSubscriptionEmail.mockRejectedValue(
      this.emailError,
    );
  }

  thenCancelSubscriptionCalledWithUser() {
    expect(this.stripeRepository.cancelSubscription).toHaveBeenCalledWith(
      this.user,
    );
    expect(this.stripeRepository.cancelSubscription).toHaveBeenCalledTimes(1);
  }

  thenSendCancelSubscriptionEmailCalledWithExpectedPayload() {
    expect(this.emailProvider.sendCancelSubscriptionEmail).toHaveBeenCalledWith(
      {
        email: this.user.email,
        firstname: this.user.metadata.firstname,
        planName: this.canceledSubscription.planName,
        endDate: this.canceledSubscription.endDate,
      },
    );
    expect(
      this.emailProvider.sendCancelSubscriptionEmail,
    ).toHaveBeenCalledTimes(1);
  }

  thenSendCancelSubscriptionEmailNotCalled() {
    expect(
      this.emailProvider.sendCancelSubscriptionEmail,
    ).not.toHaveBeenCalled();
  }

  thenReturnsCanceledPayload(result: CancelSubscription) {
    expect(result).toEqual(this.canceledSubscription);
  }

  async thenThrowStripeError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.stripeError);
  }

  async thenThrowEmailError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.emailError);
  }
}
