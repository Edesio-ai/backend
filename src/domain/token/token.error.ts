export abstract class TokenError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

export class ServerTokenError extends TokenError {
  readonly code = 'SERVER_TOKEN_ERROR';
  readonly httpStatus = 500;
  constructor(message: string) {
    super(message);
  }
}
