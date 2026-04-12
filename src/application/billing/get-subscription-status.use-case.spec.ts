import { GetSubscriptionStatusUseCase } from './get-subscription-status.use-case';
import { SupabaseUser } from '../../domain/auth/types/auth.type';
import { EstablishmentNotFoundError } from '../../domain/establishment/error';
import { TeacherNotFoundError } from '../../domain/teaching/error';
import { StripeClientInterface } from '../../domain/billing/contracts/stripe-client.interface';
import { EstablishmentRepository } from '../../domain/teaching/interface/establishment.repository';
import { TeacherRepository } from '../../domain/teaching/interface/teacher.repository';

describe('GetSubscriptionStatusUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return active subscription for student role without payment calls', async () => {
    const result = await fixtures.whenExecuteWith(fixtures.studentUser);

    fixtures.thenReturnStudentSubscription(result);
    fixtures.thenPaymentClientNotCalled();
  });

  it('should return inactive subscription when email is missing', async () => {
    const result = await fixtures.whenExecuteWith(fixtures.userWithoutEmail);

    fixtures.thenReturnInactiveSubscriptionWithoutEmail(result);
    fixtures.thenPaymentClientNotCalled();
  });

  it('should return inactive subscription when no customer is found', async () => {
    fixtures.whenNoCustomerFound();

    const result = await fixtures.whenExecuteWith(fixtures.establishmentUser);

    fixtures.thenCustomerLookupCalledWithUserEmail();
    fixtures.thenSessionLookupCalledWithUserId();
    fixtures.thenSubscriptionsLookupNotCalled();
    fixtures.thenReturnInactiveSubscription(result);
  });

  it('should return active subscription when active subscription is found', async () => {
    fixtures.whenCustomerFound();
    fixtures.whenSubscriptionsReturnActive();

    const result = await fixtures.whenExecuteWith(fixtures.establishmentUser);

    fixtures.thenCustomerLookupCalledWithUserEmail();
    fixtures.thenSubscriptionsLookupCalledWithCustomerId();
    fixtures.thenReturnActiveSubscription(result);
  });

  it('should return pending subscription when status is past_due', async () => {
    fixtures.whenCustomerFound();
    fixtures.whenSubscriptionsReturnPastDue();

    const result = await fixtures.whenExecuteWith(fixtures.establishmentUser);

    fixtures.thenReturnPendingSubscription(result);
  });

  it('should propagate payment client errors', async () => {
    fixtures.whenCustomerLookupThrowsError();

    const promise = fixtures.whenExecuteWith(fixtures.establishmentUser);

    await fixtures.thenThrowPaymentClientError(promise);
  });
});

class Fixtures {
  public readonly paymentClient: jest.Mocked<StripeClientInterface>;
  public readonly teacherRepository: jest.Mocked<TeacherRepository>;
  public readonly establishmentRepository: jest.Mocked<EstablishmentRepository>;
  public readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase;

  public readonly establishmentUser: SupabaseUser;
  public readonly studentUser: SupabaseUser;
  public readonly teacherUser: SupabaseUser;
  public readonly userWithoutEmail: SupabaseUser;
  public readonly customerId: string;
  public readonly paymentClientError: Error;
  public readonly teacher = {
    id: 'teacher-1',
    name: 'Teacher',
    email: 'teacher@school.com',
    created_at: '2026-01-01T00:00:00.000Z',
    establishment_id: 'est-1',
    available_chatbots: 2,
    supabase_user_id: 'user-2',
  };
  public readonly establishment = {
    id: 'est-1',
    supabase_user_id: 'owner-1',
    name: 'Edesio Academy',
    email: 'billing@academy.com',
    created_at: '2026-01-01T00:00:00.000Z',
  };

  constructor() {
    this.paymentClient = {
      getCustomerByEmail: jest.fn(),
      getCheckoutSessionByUserId: jest.fn(),
      getSubscriptionsByCustomerId: jest.fn(),
      createCheckoutSession: jest.fn(),
      getCheckoutSession: jest.fn(),
    };
    this.teacherRepository = {
      linkTeacherToEstablishment: jest.fn(),
      getTeacherByEstablishmentId: jest.fn(),
      getTeachersSessionsByIds: jest.fn(),
      getTeacherByUserId: jest.fn(),
      createTeacher: jest.fn(),
    };
    this.establishmentRepository = {
      getEstablishmentById: jest.fn(),
      getEstablishmentByUserId: jest.fn(),
      createEstablishment: jest.fn(),
      getInvitationTokenByEstablishmentId: jest.fn(),
    };

    this.getSubscriptionStatusUseCase = new GetSubscriptionStatusUseCase(
      this.paymentClient,
      this.teacherRepository,
      this.establishmentRepository,
    );

    this.customerId = 'cus_123';
    this.paymentClientError = new Error('stripe unavailable');

    this.establishmentUser = this.createUser(
      'establishment',
      'owner@school.com',
      'user-1',
    );
    this.studentUser = this.createUser(
      'student',
      'student@school.com',
      'user-3',
    );
    this.teacherUser = this.createUser(
      'teacher',
      'teacher@school.com',
      'user-2',
    );
    this.userWithoutEmail = this.createUser('establishment', '', 'user-4');
  }

  private createUser(role: string, email: string, id: string): SupabaseUser {
    return {
      id,
      aud: 'authenticated',
      role: 'authenticated',
      email,
      email_confirmed_at: '2026-01-01T00:00:00.000Z',
      phone: '',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { role },
      identities: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      is_anonymous: false,
    };
  }

  whenExecuteWith(user: SupabaseUser) {
    return this.getSubscriptionStatusUseCase.execute(user);
  }

  whenNoCustomerFound() {
    this.paymentClient.getCustomerByEmail.mockResolvedValue([]);
    this.paymentClient.getCheckoutSessionByUserId.mockResolvedValue(null);
  }

  whenCustomerFound() {
    this.paymentClient.getCustomerByEmail.mockResolvedValue([
      { id: this.customerId },
    ]);
  }

  whenTeacherFound(
    establishmentId: string | null = this.teacher.establishment_id,
  ) {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue({
      ...this.teacher,
      establishment_id: establishmentId as any,
    });
  }

  whenTeacherNotFound() {
    this.teacherRepository.getTeacherByUserId.mockResolvedValue(null as any);
  }

  whenEstablishmentFound() {
    this.establishmentRepository.getEstablishmentById.mockResolvedValue(
      this.establishment as any,
    );
  }

  whenEstablishmentNotFound() {
    this.establishmentRepository.getEstablishmentById.mockResolvedValue(
      null as any,
    );
  }

  whenSubscriptionsReturnActive() {
    this.paymentClient.getSubscriptionsByCustomerId.mockResolvedValue(
      this.createSubscriptionsPayload([
        {
          status: 'active',
          cancel_at_period_end: false,
          current_period_end: Math.floor(Date.now() / 1000) + 3600,
        },
      ]),
    );
  }

  whenSubscriptionsReturnPastDue() {
    this.paymentClient.getSubscriptionsByCustomerId.mockResolvedValue(
      this.createSubscriptionsPayload([
        {
          status: 'past_due',
          cancel_at_period_end: false,
          current_period_end: Math.floor(Date.now() / 1000) + 3600,
        },
      ]),
    );
  }

  private createSubscriptionsPayload(subscriptions: any[]) {
    const payload = [...subscriptions] as any;
    payload.data = subscriptions;
    return payload;
  }

  whenCustomerLookupThrowsError() {
    this.paymentClient.getCustomerByEmail.mockRejectedValue(
      this.paymentClientError,
    );
  }

  async thenThrowPaymentClientError(promise: Promise<unknown>) {
    await expect(promise).rejects.toBe(this.paymentClientError);
  }

  thenPaymentClientNotCalled() {
    expect(this.paymentClient.getCustomerByEmail).not.toHaveBeenCalled();
    expect(
      this.paymentClient.getCheckoutSessionByUserId,
    ).not.toHaveBeenCalled();
    expect(
      this.paymentClient.getSubscriptionsByCustomerId,
    ).not.toHaveBeenCalled();
  }

  thenTeacherRepositoryNotCalled() {
    expect(this.teacherRepository.getTeacherByUserId).not.toHaveBeenCalled();
  }

  thenEstablishmentRepositoryNotCalled() {
    expect(
      this.establishmentRepository.getEstablishmentById,
    ).not.toHaveBeenCalled();
  }

  thenCustomerLookupCalledWithUserEmail() {
    expect(this.paymentClient.getCustomerByEmail).toHaveBeenCalledWith(
      this.establishmentUser.email,
    );
    expect(this.paymentClient.getCustomerByEmail).toHaveBeenCalledTimes(1);
  }

  thenSessionLookupCalledWithUserId() {
    expect(this.paymentClient.getCheckoutSessionByUserId).toHaveBeenCalledWith(
      this.establishmentUser.id,
    );
    expect(this.paymentClient.getCheckoutSessionByUserId).toHaveBeenCalledTimes(
      1,
    );
  }

  thenSubscriptionsLookupCalledWithCustomerId() {
    expect(
      this.paymentClient.getSubscriptionsByCustomerId,
    ).toHaveBeenCalledWith(this.customerId);
    expect(
      this.paymentClient.getSubscriptionsByCustomerId,
    ).toHaveBeenCalledTimes(1);
  }

  thenSubscriptionsLookupNotCalled() {
    expect(
      this.paymentClient.getSubscriptionsByCustomerId,
    ).not.toHaveBeenCalled();
  }

  thenReturnStudentSubscription(result: any) {
    expect(result).toEqual({
      hasActiveSubscription: true,
      role: 'student',
    });
  }

  thenReturnInactiveSubscriptionWithoutEmail(result: any) {
    expect(result).toEqual({
      hasActiveSubscription: false,
      role: 'establishment',
    });
  }

  thenReturnInactiveSubscription(result: any) {
    expect(result).toEqual({
      hasActiveSubscription: false,
      role: 'establishment',
    });
  }

  thenReturnActiveSubscription(result: any) {
    expect(result).toEqual({
      hasActiveSubscription: true,
      status: 'active',
      cancelAtPeriodEnd: false,
      currentPeriodEnd: expect.any(Number),
      isPending: false,
      role: 'establishment',
    });
  }

  thenReturnPendingSubscription(result: any) {
    expect(result).toEqual({
      hasActiveSubscription: false,
      status: 'past_due',
      cancelAtPeriodEnd: false,
      currentPeriodEnd: expect.any(Number),
      isPending: true,
      role: 'establishment',
    });
  }
}

describe('GetSubscriptionStatusUseCase - teacher flow', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should throw TeacherNotFoundError when teacher does not exist', async () => {
    fixtures.whenTeacherNotFound();

    const promise = fixtures.whenExecuteWith(fixtures.teacherUser);

    await expect(promise).rejects.toBeInstanceOf(TeacherNotFoundError);
    expect(fixtures.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(
      fixtures.teacherUser.id,
    );
  });

  it('should use teacher email when teacher has no establishment', async () => {
    fixtures.whenTeacherFound(null);
    fixtures.whenCustomerFound();
    fixtures.whenSubscriptionsReturnActive();

    const result = await fixtures.whenExecuteWith(fixtures.teacherUser);

    expect(fixtures.teacherRepository.getTeacherByUserId).toHaveBeenCalledWith(
      fixtures.teacherUser.id,
    );
    fixtures.thenEstablishmentRepositoryNotCalled();
    expect(fixtures.paymentClient.getCustomerByEmail).toHaveBeenCalledWith(
      fixtures.teacherUser.email,
    );
    expect(result.hasActiveSubscription).toBe(true);
    expect(result.role).toBe('teacher');
  });

  it('should use establishment billing email when teacher is attached', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenEstablishmentFound();
    fixtures.whenCustomerFound();
    fixtures.whenSubscriptionsReturnActive();

    await fixtures.whenExecuteWith(fixtures.teacherUser);

    expect(
      fixtures.establishmentRepository.getEstablishmentById,
    ).toHaveBeenCalledWith(fixtures.teacher.establishment_id);
    expect(fixtures.paymentClient.getCustomerByEmail).toHaveBeenCalledWith(
      fixtures.establishment.email,
    );
  });

  it('should throw EstablishmentNotFoundError when teacher establishment is missing', async () => {
    fixtures.whenTeacherFound();
    fixtures.whenEstablishmentNotFound();

    const promise = fixtures.whenExecuteWith(fixtures.teacherUser);

    await expect(promise).rejects.toBeInstanceOf(EstablishmentNotFoundError);
  });
});
