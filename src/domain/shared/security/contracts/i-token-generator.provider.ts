export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');

export interface ITokenGeneratorProvider {
  generateHex(bytes: number): string;
}
