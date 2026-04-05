import { PaymentSuccessUseCase } from "./payment-success.use-case";
import { PaymentClientInterface } from "../../interfaces/payment.interface";
import { StripeSession } from "../../domain/billing/billing.type";

describe("PaymentSuccessUseCase", () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it("should return checkout session from payment client", async () => {
        fixtures.whenPaymentClientReturnsCheckoutSession();

        const result = await fixtures.whenExecuteWith(fixtures.sessionId);

        fixtures.thenPaymentClientCalledWithSessionId();
        fixtures.thenReturnExpectedSession(result);
    });

    it("should propagate payment client error", async () => {
        fixtures.whenPaymentClientThrowsError();

        const promise = fixtures.whenExecuteWith(fixtures.sessionId);

        await fixtures.thenThrowPaymentClientError(promise);
        fixtures.thenPaymentClientCalledWithSessionId();
    });
});

class Fixtures {
    public readonly paymentClient: jest.Mocked<PaymentClientInterface>;
    public readonly paymentSuccessUseCase: PaymentSuccessUseCase;

    public readonly sessionId: string;
    public readonly checkoutSession: StripeSession;
    public readonly paymentClientError: Error;

    constructor() {
        this.paymentClient = {
            getCustomerByEmail: jest.fn(),
            getCheckoutSessionByUserId: jest.fn(),
            getSubscriptionsByCustomerId: jest.fn(),
            createCheckoutSession: jest.fn(),
            getCheckoutSession: jest.fn(),
        };

        this.paymentSuccessUseCase = new PaymentSuccessUseCase(this.paymentClient);

        this.sessionId = "cs_test_123";
        this.checkoutSession = {
            id: this.sessionId,
            customerId: "cus_123",
            subscriptionId: "sub_123",
            status: "complete",
            paymentStatus: "paid",
            metadata: { plan: "pro" },
        };
        this.paymentClientError = new Error("stripe unavailable");
    }

    whenExecuteWith(sessionId: string) {
        return this.paymentSuccessUseCase.execute(sessionId);
    }

    whenPaymentClientReturnsCheckoutSession() {
        this.paymentClient.getCheckoutSession.mockResolvedValue(this.checkoutSession);
    }

    whenPaymentClientThrowsError() {
        this.paymentClient.getCheckoutSession.mockRejectedValue(this.paymentClientError);
    }

    async thenThrowPaymentClientError(promise: Promise<unknown>) {
        await expect(promise).rejects.toBe(this.paymentClientError);
    }

    thenPaymentClientCalledWithSessionId() {
        expect(this.paymentClient.getCheckoutSession).toHaveBeenCalledWith(this.sessionId);
        expect(this.paymentClient.getCheckoutSession).toHaveBeenCalledTimes(1);
    }

    thenReturnExpectedSession(result: StripeSession) {
        expect(result).toEqual(this.checkoutSession);
    }
}
