import { Inject } from '@nestjs/common';
import { TOKEN_GENERATOR } from '../../interfaces/security/token-generator.provider';
import type { TokenGeneratorProvider } from '../../interfaces/security/token-generator.provider';

export type CsrfTokenPayload = {
  csrfToken: string;
  maxAgeMs: number;
};

export class GenerateCsrfTokenUseCase {
  constructor(
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGeneratorProvider,
  ) {}

  execute(): CsrfTokenPayload {
    return {
      csrfToken: this.tokenGenerator.generateHex(32),
      maxAgeMs: 24 * 60 * 60 * 1000,
    };
  }
}
