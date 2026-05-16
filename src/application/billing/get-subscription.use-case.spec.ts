import { GetSubscriptionUseCase } from './get-subscription.use-case';
import { IStripeProvider } from '../../domain/billing/contracts/i-stripe-client.provider';
import { StripeSubscription } from '../../domain/billing/types/billing.type';
import { User } from '../../domain/auth/types/auth.type';
import { Establishment } from '../../domain/teaching/establishment/types/establishment.type';
import { Teacher } from '../../domain/teaching/teacher/types/teacher.type';
import { createMockEstablishmentRepository } from 'src/testing/mock-establishment-repository';
import { createMockTeacherRepository } from 'src/testing/mock-teacher-repository';
import { createMockStripeProvider } from 'src/testing/mock-stripe-provider';

describe('GetSubscriptionUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return subscription from stripe for user email when role is not teacher', async () => {
    fixtures.whenStripeReturnsSubscription();

    const result = await fixtures.whenExecute();

    fixtures.thenGetUserSubscriptionCalledWith(fixtures.user.email);
    fixtures.thenReturnsExpectedSubscription(result);
    fixtures.thenTeacherRepositoryNotCalled();
  });

  it('should return null when stripe returns null for non-teacher', async () => {
    fixtures.whenStripeReturnsNull();

    const result = await fixtures.whenExecute();

    fixtures.thenReturnsNull(result);
    fixtures.thenGetUserSubscriptionCalledWith(fixtures.user.email);
    fixtures.thenTeacherRepositoryNotCalled();
  });

  it('should propagate stripe error for non-teacher', async () => {
    fixtures.whenStripeThrowsError();

    const promise = fixtures.whenExecute();

    await fixtures.thenThrowRepositoryError(promise);
    fixtures.thenGetUserSubscriptionCalledWith(fixtures.user.email);
  });

  it('should resolve stripe by teacher email when teacher has no establishment', async () => {
    fixtures.whenUserIsTeacherWithoutEstablishment();
    fixtures.whenStripeReturnsSubscription();

    const result = await fixtures.whenExecute();

    fixtures.thenGetTeacherByUserIdCalledWith(fixtures.user.id);
    fixtures.thenGetEstablishmentByIdNotCalled();
    fixtures.thenGetUserSubscriptionCalledWith(fixtures.user.email);
    fixtures.thenReturnsExpectedSubscription(result);
    fixtures.thenSubscriptionWithoutEstablishmentFlag(result);
  });

  it('should resolve stripe by establishment owner email and flag subscription when teacher has establishment', async () => {
    fixtures.whenUserIsTeacherWithEstablishment();
    fixtures.whenStripeReturnsSubscription();

    const result = await fixtures.whenExecute();

    fixtures.thenGetTeacherByUserIdCalledWith(fixtures.user.id);
    fixtures.thenGetEstablishmentByIdCalledWith(fixtures.establishment.id);
    fixtures.thenGetUserSubscriptionCalledWith(fixtures.establishment.email);
    fixtures.thenReturnsExpectedSubscription(result);
    fixtures.thenSubscriptionIsEstablishment(result);
  });

  it('should return null when establishment billing stripe returns null for linked teacher', async () => {
    fixtures.whenUserIsTeacherWithEstablishment();
    fixtures.whenStripeReturnsNull();

    const result = await fixtures.whenExecute();

    fixtures.thenReturnsNull(result);
    fixtures.thenGetUserSubscriptionCalledWith(fixtures.establishment.email);
    fixtures.thenGetEstablishmentByIdCalledWith(fixtures.establishment.id);
  });

  it('should fall back to teacher email stripe when teacher row is missing', async () => {
    fixtures.whenUserIsTeacherButRepositoryReturnsNull();
    fixtures.whenStripeReturnsSubscription();

    const result = await fixtures.whenExecute();

    fixtures.thenGetTeacherByUserIdCalledWith(fixtures.user.id);
    fixtures.thenGetEstablishmentByIdNotCalled();
    fixtures.thenGetUserSubscriptionCalledWith(fixtures.user.email);
    fixtures.thenReturnsExpectedSubscription(result);
    fixtures.thenSubscriptionWithoutEstablishmentFlag(result);
  });

  it('should return null when establishment cannot be loaded for linked teacher', async () => {
    fixtures.whenUserIsTeacherWithEstablishment();
    fixtures.whenEstablishmentByIdReturnsNull();

    const result = await fixtures.whenExecute();

    fixtures.thenReturnsNull(result);
    fixtures.thenGetEstablishmentByIdCalledWith(fixtures.establishment.id);
    fixtures.thenGetUserSubscriptionNotCalled();
  });
});

class Fixtures {
  public readonly stripeRepository: jest.Mocked<IStripeProvider>;
  public readonly teacherRepository: ReturnType<
    typeof createMockTeacherRepository
  >;
  public readonly establishmentRepository: ReturnType<
    typeof createMockEstablishmentRepository
  >;
  public readonly getSubscriptionUseCase: GetSubscriptionUseCase;

  public user: User;
  public readonly subscription: StripeSubscription;
  public readonly establishment: Establishment;
  public readonly teacherWithEstablishment: Teacher;
  public readonly repositoryError: Error;

  constructor() {
    this.stripeRepository = createMockStripeProvider();

    this.teacherRepository = createMockTeacherRepository();
    this.establishmentRepository = createMockEstablishmentRepository();

    this.getSubscriptionUseCase = new GetSubscriptionUseCase(
      this.stripeRepository,
      this.teacherRepository,
      this.establishmentRepository,
    );

    this.user = {
      id: 'u-1',
      email: 'bill@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'establishment' },
    };

    this.subscription = {
      id: 'sub_x',
      status: 'active',
      plan: 'Pro',
      interval: 'month',
      amount: 1000,
      currency: 'eur',
      currentPeriodEnd: 1780857684,
      cancelAtPeriodEnd: false,
      last4: '4242',
      cardBrand: 'visa',
    };

    this.establishment = {
      id: 'est-1',
      supabaseUserId: 'owner-u',
      name: 'School',
      email: 'billing@school.com',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    this.teacherWithEstablishment = {
      id: 'teacher-1',
      name: 'Jane',
      email: 'teacher@school.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      establishmentId: this.establishment.id,
      availableChatbots: 1,
    };

    this.repositoryError = new Error('stripe unavailable');
  }

  whenExecute() {
    return this.getSubscriptionUseCase.execute(this.user);
  }

  whenStripeReturnsSubscription() {
    this.stripeRepository.getUserSubscription.mockResolvedValue(
      this.subscription,
    );
  }

  whenStripeReturnsNull() {
    this.stripeRepository.getUserSubscription.mockResolvedValue(null);
  }

  whenStripeThrowsError() {
    this.stripeRepository.getUserSubscription.mockRejectedValue(
      this.repositoryError,
    );
  }

  whenUserIsTeacherWithoutEstablishment() {
    this.user = {
      id: 't-1',
      email: 'teacher@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'teacher' },
    };
    this.teacherRepository.getTeacherByUserId.mockResolvedValue({
      id: 'teacher-1',
      name: 'Jane',
      email: this.user.email,
      createdAt: '2026-01-01T00:00:00.000Z',
      establishmentId: null,
      availableChatbots: 0,
    });
  }

  whenUserIsTeacherWithEstablishment() {
    this.user = {
      id: 't-1',
      email: 'teacher@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'teacher' },
    };
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(
      this.teacherWithEstablishment,
    );
    this.establishmentRepository.getEstablishmentById.mockResolvedValue(
      this.establishment,
    );
  }

  whenUserIsTeacherButRepositoryReturnsNull() {
    this.user = {
      id: 't-1',
      email: 'teacher@school.com',
      emailConfirmedAt: '2026-01-01T00:00:00.000Z',
      metadata: { role: 'teacher' },
    };
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null);
  }

  whenEstablishmentByIdReturnsNull() {
    this.establishmentRepository.getEstablishmentById.mockResolvedValue(
      null as unknown as Establishment,
    );
  }

  thenGetUserSubscriptionCalledWith(email: string, times = 1) {
    expect(this.stripeRepository.getUserSubscription).toHaveBeenCalledWith(
      email,
    );
    expect(this.stripeRepository.getUserSubscription).toHaveBeenCalledTimes(
      times,
    );
  }

  thenGetUserSubscriptionNotCalled() {
    expect(this.stripeRepository.getUserSubscription).not.toHaveBeenCalled();
  }

  thenReturnsExpectedSubscription(result: StripeSubscription | null) {
    expect(result).toEqual(this.subscription);
  }

  thenReturnsNull(result: StripeSubscription | null) {
    expect(result).toBeNull();
  }

  async thenThrowRepositoryError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.repositoryError);
  }

  thenTeacherRepositoryNotCalled() {
    expect(this.teacherRepository.getTeacherByUserId).not.toHaveBeenCalled();
  }

  thenGetTeacherByUserIdCalledWith(userId: string) {
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(
      userId,
    );
    expect(this.teacherRepository.getTeacherByUserId).toHaveBeenCalledTimes(1);
  }

  thenGetEstablishmentByIdNotCalled() {
    expect(
      this.establishmentRepository.getEstablishmentById,
    ).not.toHaveBeenCalled();
  }

  thenGetEstablishmentByIdCalledWith(establishmentId: string) {
    expect(
      this.establishmentRepository.getEstablishmentById,
    ).toHaveBeenCalledWith(establishmentId);
    expect(
      this.establishmentRepository.getEstablishmentById,
    ).toHaveBeenCalledTimes(1);
  }

  thenSubscriptionIsEstablishment(result: StripeSubscription | null) {
    expect(result?.isEstablishmentSubscription).toBe(true);
  }

  thenSubscriptionWithoutEstablishmentFlag(result: StripeSubscription | null) {
    expect(result?.isEstablishmentSubscription).toBeUndefined();
  }
}
