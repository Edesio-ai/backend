import { SubscriptionSupabaseRepository } from './subscription-supabase.repository';
import { FetchSubscriptionError } from '../../../../domain/subscription/subscription.error';

describe('SubscriptionSupabaseRepository', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return first subscription when query succeeds', async () => {
    fixtures.whenSupabaseReturnsSubscriptions();

    const result = await fixtures.whenGetUserSubscription();

    fixtures.thenQueryBuiltWithExpectedArguments();
    fixtures.thenReturnFirstSubscription(result);
  });

  it('should return null when no subscription is found', async () => {
    fixtures.whenSupabaseReturnsEmptySubscriptions();

    const result = await fixtures.whenGetUserSubscription();

    fixtures.thenQueryBuiltWithExpectedArguments();
    expect(result).toBeNull();
  });

  it('should throw FetchSubscriptionError when query fails', async () => {
    fixtures.whenSupabaseReturnsError();

    const promise = fixtures.whenGetUserSubscription();

    await fixtures.thenThrowFetchSubscriptionError(promise);
    fixtures.thenQueryBuiltWithExpectedArguments();
  });
});

class Fixtures {
  public readonly userId = 'user-1';
  public readonly subscriptions = [
    {
      id: 'sub-row-1',
      subscriber_id: this.userId,
      checkout_url: 'https://checkout.existing',
    },
  ];

  private readonly eqMock = jest.fn();
  private readonly selectMock = jest.fn(() => ({ eq: this.eqMock }));
  private readonly fromMock = jest.fn(() => ({ select: this.selectMock }));

  public readonly repository: SubscriptionSupabaseRepository;

  constructor() {
    const supabaseMock = {
      from: this.fromMock,
    };
    this.repository = new SubscriptionSupabaseRepository(supabaseMock as any);
  }

  whenGetUserSubscription() {
    return this.repository.getUserSubscription(this.userId);
  }

  whenSupabaseReturnsSubscriptions() {
    this.eqMock.mockResolvedValue({
      data: this.subscriptions,
      error: null,
    });
  }

  whenSupabaseReturnsEmptySubscriptions() {
    this.eqMock.mockResolvedValue({
      data: [],
      error: null,
    });
  }

  whenSupabaseReturnsError() {
    this.eqMock.mockResolvedValue({
      data: null,
      error: new Error('query failed'),
    });
  }

  async thenThrowFetchSubscriptionError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBeInstanceOf(FetchSubscriptionError);
    await expect(promise).rejects.toThrow('query failed');
  }

  thenQueryBuiltWithExpectedArguments() {
    expect(this.fromMock).toHaveBeenCalledWith('subscription');
    expect(this.selectMock).toHaveBeenCalledWith('*');
    expect(this.eqMock).toHaveBeenCalledWith('subscriber_id', this.userId);
    expect(this.eqMock).toHaveBeenCalledTimes(1);
  }

  thenReturnFirstSubscription(result: any) {
    expect(result).toEqual(this.subscriptions[0]);
  }
}
