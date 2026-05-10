import { GenerateCsrfTokenUseCase } from './generate-csrf-token.use-case';
import { ITokenGeneratorProvider } from '../../domain/shared/security/contracts/i-token-generator.provider';

describe('GenerateCsrfTokenUseCase', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should return csrf payload with generated token and maxAge', () => {
    fixtures.whenTokenGeneratorReturnsToken();

    const result = fixtures.whenExecute();

    fixtures.thenTokenGeneratorCalledWithDefaultBytes();
    fixtures.thenReturnExpectedPayload(result);
  });
});

class Fixtures {
  public readonly tokenGenerator: jest.Mocked<ITokenGeneratorProvider>;
  public readonly generateCsrfTokenUseCase: GenerateCsrfTokenUseCase;

  public readonly generatedToken: string;

  constructor() {
    this.tokenGenerator = {
      generateHex: jest.fn(),
    };

    this.generateCsrfTokenUseCase = new GenerateCsrfTokenUseCase(
      this.tokenGenerator,
    );
    this.generatedToken = 'csrf-token-123';
  }

  whenExecute() {
    return this.generateCsrfTokenUseCase.execute();
  }

  whenTokenGeneratorReturnsToken() {
    this.tokenGenerator.generateHex.mockReturnValue(this.generatedToken);
  }

  thenTokenGeneratorCalledWithDefaultBytes() {
    expect(this.tokenGenerator.generateHex).toHaveBeenCalledWith(32);
    expect(this.tokenGenerator.generateHex).toHaveBeenCalledTimes(1);
  }

  thenReturnExpectedPayload(result: { csrfToken: string; maxAgeMs: number }) {
    expect(result).toEqual({
      csrfToken: this.generatedToken,
      maxAgeMs: 24 * 60 * 60 * 1000,
    });
  }
}
