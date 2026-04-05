export abstract class SubscriptionError extends Error {
    abstract readonly code: string;
    abstract readonly httpStatus: number;
}


export class FetchSubscriptionError extends SubscriptionError {
    readonly code = 'FETCH_SUBSCRIPTION_ERROR';
    readonly httpStatus = 500;
    constructor(message?: string) { super(message || 'Error fetching subscription'); }
}