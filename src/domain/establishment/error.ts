export abstract class EstablishmentError extends Error {
    abstract readonly code: string;
    abstract readonly httpStatus: number;
}

export class EstablishmentNotFoundError extends EstablishmentError {
    readonly code = 'ESTABLISHMENT_NOT_FOUND';
    readonly httpStatus = 404;
    constructor(message?: string) { super(message || 'Establishment not found'); }
}