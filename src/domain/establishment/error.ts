export abstract class EstablishmentError extends Error {
    abstract readonly code: string;
    abstract readonly httpStatus: number;
}

export class EstablishmentNotFoundError extends EstablishmentError {
    readonly code = 'ESTABLISHMENT_NOT_FOUND';
    readonly httpStatus = 404;
    constructor(message?: string) { super(message || 'Establishment not found'); }
}

export class EstablishmentIdNotFoundError extends EstablishmentError {
    readonly code = 'ESTABLISHMENT_ID_NOT_FOUND';
    readonly httpStatus = 400;
    constructor(message?: string) { super(message || 'Establishment id not found'); }
}

export class EstablishmentCreationFailedError extends EstablishmentError {
    readonly code = 'ESTABLISHMENT_CREATION_FAILED';
    readonly httpStatus = 500;
    constructor(message?: string) { super(message || 'Establishment creation failed'); }
}