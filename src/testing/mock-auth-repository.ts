import type { IAuthRepository } from 'src/domain/auth/contracts/i-auth.repository';

export function createMockAuthRepository(): jest.Mocked<IAuthRepository> {
  return {
    createAuthUser: jest.fn(),
    loginUser: jest.fn(),
    validateToken: jest.fn(),
    logoutUser: jest.fn(),
    updateAuthUser: jest.fn(),
  };
}
