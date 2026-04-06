import { GetSubscriptionStatusUseCase } from "./get-subscription-status.use-case";
import { PaymentClientInterface } from "../../interfaces/payment.interface";
import { User } from "../../domain/auth/auth.type";

describe("GetSubscriptionStatusUseCase", () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it("should return active subscription for student role without payment calls", async () => {
        const result = await fixtures.whenExecuteWith(fixtures.studentUser);

        fixtures.thenReturnStudentSubscription(result);
        fixtures.thenPaymentClientNotCalled();
    });

    it("should return inactive subscription when email is missing", async () => {
        const result = await fixtures.whenExecuteWith(fixtures.userWithoutEmail);

        fixtures.thenReturnInactiveSubscriptionWithoutEmail(result);
        fixtures.thenPaymentClientNotCalled();
    });

    it("should return inactive subscription when no customer is found", async () => {
        fixtures.whenNoCustomerFound();

        const result = await fixtures.whenExecuteWith(fixtures.establishmentUser);

        fixtures.thenCustomerLookupCalledWithUserEmail();
        fixtures.thenSessionLookupCalledWithUserId();
        fixtures.thenSubscriptionsLookupNotCalled();
        fixtures.thenReturnInactiveSubscription(result);
    });

    it("should return active subscription when active subscription is found", async () => {
        fixtures.whenCustomerFound();
        fixtures.whenSubscriptionsReturnActive();

        const result = await fixtures.whenExecuteWith(fixtures.establishmentUser);

        fixtures.thenCustomerLookupCalledWithUserEmail();
        fixtures.thenSubscriptionsLookupCalledWithCustomerId();
        fixtures.thenReturnActiveSubscription(result);
    });

    it("should return pending subscription when status is past_due", async () => {
        fixtures.whenCustomerFound();
        fixtures.whenSubscriptionsReturnPastDue();

        const result = await fixtures.whenExecuteWith(fixtures.establishmentUser);

        fixtures.thenReturnPendingSubscription(result);
    });

    it("should propagate payment client errors", async () => {
        fixtures.whenCustomerLookupThrowsError();

        const promise = fixtures.whenExecuteWith(fixtures.establishmentUser);

        await fixtures.thenThrowPaymentClientError(promise);
    });
});

class Fixtures {
    public readonly paymentClient: jest.Mocked<PaymentClientInterface>;
    public readonly getSubscriptionStatusUseCase: GetSubscriptionStatusUseCase;

    public readonly establishmentUser: User;
    public readonly studentUser: User;
    public readonly userWithoutEmail: User;
    public readonly customerId: string;
    public readonly paymentClientError: Error;

    constructor() {
        this.paymentClient = {
            getCustomerByEmail: jest.fn(),
            getCheckoutSessionByUserId: jest.fn(),
            getSubscriptionsByCustomerId: jest.fn(),
            createCheckoutSession: jest.fn(),
            getCheckoutSession: jest.fn(),
        };

        this.getSubscriptionStatusUseCase = new GetSubscriptionStatusUseCase(this.paymentClient);

        this.customerId = "cus_123";
        this.paymentClientError = new Error("stripe unavailable");

        this.establishmentUser = this.createUser("establishment", "owner@school.com");
        this.studentUser = this.createUser("student", "student@school.com");
        this.userWithoutEmail = this.createUser("establishment", "");
    }

    private createUser(role: string, email: string): User {
        return {
            id: "user-1",
            aud: "authenticated",
            role: "authenticated",
            email,
            email_confirmed_at: "2026-01-01T00:00:00.000Z",
            phone: "",
            app_metadata: { provider: "email", providers: ["email"] },
            user_metadata: { role },
            identities: [],
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
            is_anonymous: false,
        };
    }

    whenExecuteWith(user: User) {
        return this.getSubscriptionStatusUseCase.execute(user);
    }

    whenNoCustomerFound() {
        this.paymentClient.getCustomerByEmail.mockResolvedValue([]);
        this.paymentClient.getCheckoutSessionByUserId.mockResolvedValue(null);
    }

    whenCustomerFound() {
        this.paymentClient.getCustomerByEmail.mockResolvedValue([{ id: this.customerId }]);
    }

    whenSubscriptionsReturnActive() {
        this.paymentClient.getSubscriptionsByCustomerId.mockResolvedValue(this.createSubscriptionsPayload([
            {
                status: "active",
                cancel_at_period_end: false,
                current_period_end: Math.floor(Date.now() / 1000) + 3600,
            },
        ]));
    }

    whenSubscriptionsReturnPastDue() {
        this.paymentClient.getSubscriptionsByCustomerId.mockResolvedValue(this.createSubscriptionsPayload([
            {
                status: "past_due",
                cancel_at_period_end: false,
                current_period_end: Math.floor(Date.now() / 1000) + 3600,
            },
        ]));
    }

    private createSubscriptionsPayload(subscriptions: any[]) {
        const payload = [...subscriptions] as any;
        payload.data = subscriptions;
        return payload;
    }

    whenCustomerLookupThrowsError() {
        this.paymentClient.getCustomerByEmail.mockRejectedValue(this.paymentClientError);
    }

    async thenThrowPaymentClientError(promise: Promise<unknown>) {
        await expect(promise).rejects.toBe(this.paymentClientError);
    }

    thenPaymentClientNotCalled() {
        expect(this.paymentClient.getCustomerByEmail).not.toHaveBeenCalled();
        expect(this.paymentClient.getCheckoutSessionByUserId).not.toHaveBeenCalled();
        expect(this.paymentClient.getSubscriptionsByCustomerId).not.toHaveBeenCalled();
    }

    thenCustomerLookupCalledWithUserEmail() {
        expect(this.paymentClient.getCustomerByEmail).toHaveBeenCalledWith(this.establishmentUser.email);
        expect(this.paymentClient.getCustomerByEmail).toHaveBeenCalledTimes(1);
    }

    thenSessionLookupCalledWithUserId() {
        expect(this.paymentClient.getCheckoutSessionByUserId).toHaveBeenCalledWith(this.establishmentUser.id);
        expect(this.paymentClient.getCheckoutSessionByUserId).toHaveBeenCalledTimes(1);
    }

    thenSubscriptionsLookupCalledWithCustomerId() {
        expect(this.paymentClient.getSubscriptionsByCustomerId).toHaveBeenCalledWith(this.customerId);
        expect(this.paymentClient.getSubscriptionsByCustomerId).toHaveBeenCalledTimes(1);
    }

    thenSubscriptionsLookupNotCalled() {
        expect(this.paymentClient.getSubscriptionsByCustomerId).not.toHaveBeenCalled();
    }

    thenReturnStudentSubscription(result: any) {
        expect(result).toEqual({
            hasActiveSubscription: true,
            role: "student",
        });
    }

    thenReturnInactiveSubscriptionWithoutEmail(result: any) {
        expect(result).toEqual({
            hasActiveSubscription: false,
            role: "establishment",
        });
    }

    thenReturnInactiveSubscription(result: any) {
        expect(result).toEqual({
            hasActiveSubscription: false,
            role: "establishment",
        });
    }

    thenReturnActiveSubscription(result: any) {
        expect(result).toEqual({
            hasActiveSubscription: true,
            status: "active",
            cancelAtPeriodEnd: false,
            currentPeriodEnd: expect.any(Number),
            isPending: false,
            role: "establishment",
        });
    }

    thenReturnPendingSubscription(result: any) {
        expect(result).toEqual({
            hasActiveSubscription: false,
            status: "past_due",
            cancelAtPeriodEnd: false,
            currentPeriodEnd: expect.any(Number),
            isPending: true,
            role: "establishment",
        });
    }
}
