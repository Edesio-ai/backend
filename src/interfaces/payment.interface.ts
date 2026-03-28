export const PAYMENT_CLIENT = Symbol('PAYMENT_CLIENT');

export interface PaymentClientInterface {
    getCustomerByEmail(email: string): Promise<any>;
    getCheckoutSessionByUserId(userId: string): Promise<string | null>;
    getSubscriptionsByCustomerId(customerId: string): Promise<any>;
}