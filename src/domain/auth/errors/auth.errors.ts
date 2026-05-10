export abstract class AuthError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

export class TokenUserNotFoundError extends AuthError {
  readonly code = 'TOKEN_USER_NOT_FOUND';
  readonly httpStatus = 401;
  constructor(message?: string) {
    super(message || 'Invalid or expired token');
  }
}
