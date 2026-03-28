import { StripeRepository } from "./stripe.repository";
import { StripeError } from "../../domain/billing/error";

describe("StripeRepository", () => {
    let fixtures: Fixtures;

    beforeEach(() => {
        fixtures = new Fixtures();
    });

    it("should return customers when getCustomerByEmail succeeds", async () => {
        fixtures.whenCustomersListSucceeds();

        const result = await fixtures.whenGetCustomerByEmail();

        fixtures.thenCustomersListCalledWithExpectedArguments();
        fixtures.thenReturnExpectedCustomers(result);
    });

    it("should throw StripeError when getCustomerByEmail fails", async () => {
        fixtures.whenCustomersListThrowsError();

        const promise = fixtures.whenGetCustomerByEmail();

        await fixtures.thenThrowStripeErrorWithMessagePart(promise, "Error searching customers");
    });

    it("should return customer id from checkout session when found", async () => {
        fixtures.whenCheckoutSessionsListFindsCustomer();

        const result = await fixtures.whenGetCheckoutSessionByUserId();

        fixtures.thenCheckoutSessionsListCalledWithExpectedArguments();
        fixtures.thenReturnExpectedCustomerId(result);
    });

    it("should return null when checkout session has no matching customer", async () => {
        fixtures.whenCheckoutSessionsListReturnsNoMatch();

        const result = await fixtures.whenGetCheckoutSessionByUserId();

        expect(result).toBeNull();
    });

    it("should throw StripeError when getCheckoutSessionByUserId fails", async () => {
        fixtures.whenCheckoutSessionsListThrowsError();

        const promise = fixtures.whenGetCheckoutSessionByUserId();

        await fixtures.thenThrowStripeErrorWithMessagePart(promise, "Error searching checkout sessions");
    });

    it("should return subscriptions when getSubscriptionsByCustomerId succeeds", async () => {
        fixtures.whenSubscriptionsListSucceeds();

        const result = await fixtures.whenGetSubscriptionsByCustomerId();

        fixtures.thenSubscriptionsListCalledWithExpectedArguments();
        fixtures.thenReturnExpectedSubscriptions(result);
    });

    it("should throw StripeError when getSubscriptionsByCustomerId fails", async () => {
        fixtures.whenSubscriptionsListThrowsError();

        const promise = fixtures.whenGetSubscriptionsByCustomerId();

        await fixtures.thenThrowStripeErrorWithMessagePart(promise, "Error searching subscriptions");
    });
});

class Fixtures {
    public readonly customersListMock = jest.fn();
    public readonly checkoutSessionsListMock = jest.fn();
    public readonly subscriptionsListMock = jest.fn();
    public readonly stripeRepository: StripeRepository;

    public readonly email = "owner@school.com";
    public readonly userId = "user-1";
    public readonly customerId = "cus_123";
    public readonly customers = [{ id: this.customerId }];
    public readonly subscriptions = [{ id: "sub_1", status: "active" }];

    constructor() {
        const stripeClientMock = {
            customers: {
                list: this.customersListMock,
            },
            checkout: {
                sessions: {
                    list: this.checkoutSessionsListMock,
                },
            },
            subscriptions: {
                list: this.subscriptionsListMock,
            },
        };

        this.stripeRepository = new StripeRepository(stripeClientMock as any);
    }

    whenGetCustomerByEmail() {
        return this.stripeRepository.getCustomerByEmail(this.email);
    }

    whenGetCheckoutSessionByUserId() {
        return this.stripeRepository.getCheckoutSessionByUserId(this.userId);
    }

    whenGetSubscriptionsByCustomerId() {
        return this.stripeRepository.getSubscriptionsByCustomerId(this.customerId);
    }

    whenCustomersListSucceeds() {
        this.customersListMock.mockResolvedValue({ data: this.customers });
    }

    whenCustomersListThrowsError() {
        this.customersListMock.mockRejectedValue(new Error("stripe customer failure"));
    }

    whenCheckoutSessionsListFindsCustomer() {
        this.checkoutSessionsListMock.mockResolvedValue({
            data: [
                {
                    client_reference_id: this.userId,
                    customer: this.customerId,
                },
            ],
        });
    }

    whenCheckoutSessionsListReturnsNoMatch() {
        this.checkoutSessionsListMock.mockResolvedValue({
            data: [
                {
                    client_reference_id: "another-user",
                    customer: "cus_other",
                },
            ],
        });
    }

    whenCheckoutSessionsListThrowsError() {
        this.checkoutSessionsListMock.mockRejectedValue(new Error("stripe session failure"));
    }

    whenSubscriptionsListSucceeds() {
        this.subscriptionsListMock.mockResolvedValue({ data: this.subscriptions });
    }

    whenSubscriptionsListThrowsError() {
        this.subscriptionsListMock.mockRejectedValue(new Error("stripe subscription failure"));
    }

    async thenThrowStripeErrorWithMessagePart(promise: Promise<unknown>, messagePart: string) {
        await expect(promise).rejects.toBeInstanceOf(StripeError);
        await expect(promise).rejects.toThrow(messagePart);
    }

    thenCustomersListCalledWithExpectedArguments() {
        expect(this.customersListMock).toHaveBeenCalledWith({
            email: this.email,
            limit: 1,
        });
        expect(this.customersListMock).toHaveBeenCalledTimes(1);
    }

    thenCheckoutSessionsListCalledWithExpectedArguments() {
        expect(this.checkoutSessionsListMock).toHaveBeenCalledWith({ limit: 20 });
        expect(this.checkoutSessionsListMock).toHaveBeenCalledTimes(1);
    }

    thenSubscriptionsListCalledWithExpectedArguments() {
        expect(this.subscriptionsListMock).toHaveBeenCalledWith({
            customer: this.customerId,
            limit: 10,
        });
        expect(this.subscriptionsListMock).toHaveBeenCalledTimes(1);
    }

    thenReturnExpectedCustomers(result: any) {
        expect(result).toEqual(this.customers);
    }

    thenReturnExpectedCustomerId(result: any) {
        expect(result).toEqual(this.customerId);
    }

    thenReturnExpectedSubscriptions(result: any) {
        expect(result).toEqual(this.subscriptions);
    }
}
