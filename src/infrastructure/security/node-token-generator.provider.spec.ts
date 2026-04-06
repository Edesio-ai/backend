import { NodeTokenGeneratorProvider } from './node-token-generator.provider';

describe('NodeTokenGeneratorProvider', () => {
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = new Fixtures();
  });

  it('should generate hexadecimal token with expected length', () => {
    const result = fixtures.whenGenerateHex(32);

    fixtures.thenResultHasExpectedLength(result, 64);
    fixtures.thenResultIsHexString(result);
  });

  it('should generate different tokens across calls', () => {
    const first = fixtures.whenGenerateHex(16);
    const second = fixtures.whenGenerateHex(16);

    fixtures.thenTokensAreDifferent(first, second);
  });
});

class Fixtures {
  public readonly provider: NodeTokenGeneratorProvider;

  constructor() {
    this.provider = new NodeTokenGeneratorProvider();
  }

  whenGenerateHex(bytes: number) {
    return this.provider.generateHex(bytes);
  }

  thenResultHasExpectedLength(result: string, expectedLength: number) {
    expect(result).toHaveLength(expectedLength);
  }

  thenResultIsHexString(result: string) {
    expect(result).toMatch(/^[a-f0-9]+$/);
  }

  thenTokensAreDifferent(first: string, second: string) {
    expect(first).not.toEqual(second);
  }
}
