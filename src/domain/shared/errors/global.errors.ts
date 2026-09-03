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

export class BadRequestError extends GlobalError {
  readonly code = 'BAD_REQUEST';
  readonly httpStatus = 400;
  constructor(message?: string) {
    super(message || 'Bad Request');
  }
}

export class InvitationEmailAlreadyRegisteredError extends GlobalError {
  readonly code = 'INVITATION_EMAIL_ALREADY_REGISTERED';
  readonly httpStatus = 400;
  constructor(message?: string) {
    super(message || 'User already exists');
  }
}

export class NotFoundError extends GlobalError {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = 404;
  constructor(message?: string) {
    super(message || 'Not Found');
  }
}

export class ServerError extends GlobalError {
  readonly code = 'SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Server Error');
  }
}
