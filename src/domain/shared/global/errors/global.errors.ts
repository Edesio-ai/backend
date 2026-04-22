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

export class UnauthorizedError extends GlobalError {
  readonly code = 'UNAUTHORIZED';
  readonly httpStatus = 401;
  constructor(message?: string) {
    super(message || 'Unauthorized');
  }
}
