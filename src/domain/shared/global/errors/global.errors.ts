export abstract class GlobalError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

export class ForbiddenError extends GlobalError {
  readonly code = 'FORBIDDEN';
  readonly httpStatus = 403;
  constructor(message?: string) {
    super(message || 'Forbidden');
  }
}
