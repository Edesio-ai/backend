import type { IInvitationTokenRepository } from 'src/domain/invitation-token/contract/i-invtiation-token.repository';

export function createMockInvitationTokenRepository(): jest.Mocked<IInvitationTokenRepository> {
  return {
    deleteInvitationToken: jest.fn(),
    getInvitationByToken: jest.fn(),
    markInvitationTokenAsUsed: jest.fn(),
    getInvitationTokenByEstablishmentId: jest.fn(),
    createInvitationToken: jest.fn(),
    getInvitationPreview: jest.fn(),
    updateTokenUsedAt: jest.fn(),
  };
}
