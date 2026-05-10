import { Inject } from '@nestjs/common';
import { TOKEN_GENERATOR } from '../../domain/shared/security/contracts/i-token-generator.provider';
import type { ITokenGeneratorProvider } from '../../domain/shared/security/contracts/i-token-generator.provider';

export type CsrfTokenPayload = {
  csrfToken: string;
  maxAgeMs: number;
};

export class GenerateCsrfTokenUseCase {
  constructor(
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: ITokenGeneratorProvider,
  ) {}

  execute(): CsrfTokenPayload {
    return {
      csrfToken: this.tokenGenerator.generateHex(32),
      maxAgeMs: 24 * 60 * 60 * 1000,
    };
  }
}
