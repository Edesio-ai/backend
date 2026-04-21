export abstract class OpenAiError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
}

export class OpenAiServerError extends OpenAiError {
  readonly code = 'OPENAI_SERVER_ERROR';
  readonly httpStatus = 500;
  constructor(message?: string) {
    super(message || 'OpenAI server error');
  }
}
