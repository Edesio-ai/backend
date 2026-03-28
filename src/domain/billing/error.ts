export abstract class BillingError extends Error {
    abstract readonly code: string;
    abstract readonly httpStatus: number;
}

export class StripeError extends BillingError {
    readonly code = 'STRIPE_ERROR';
    readonly httpStatus = 500;
    constructor(message?: string) { super(message || 'Stripe error'); }
}