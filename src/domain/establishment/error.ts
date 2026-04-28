export abstract class EstablishmentError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

export class EstablishmentIdNotFoundError extends EstablishmentError {
  readonly code = 'ESTABLISHMENT_ID_NOT_FOUND';
  readonly httpStatus = 400;
  constructor(message?: string) {
    super(message || 'Establishment id not found');
  }
}
