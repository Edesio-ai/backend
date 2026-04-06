export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');

export interface TokenGeneratorProvider {
  generateHex(bytes: number): string;
}
