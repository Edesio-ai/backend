export abstract class EmailError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

export class ResendApiKeyNotConfiguredError extends EmailError {
  readonly code = 'RESEND_API_KEY_NOT_CONFIGURED';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Resend API key not configured');
  }
}

export class EmailSendingError extends EmailError {
  readonly code = 'EMAIL_SENDING_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'Email sending error');
  }
}
