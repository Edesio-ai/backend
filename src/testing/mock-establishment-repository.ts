import type { EstablishmentRepository } from 'src/domain/teaching/interfaces/establishment.repository';

export function createMockEstablishmentRepository(): jest.Mocked<EstablishmentRepository> {
  return {
    createEstablishment: jest.fn(),
    getEstablishmentById: jest.fn(),
    getEstablishmentByUserId: jest.fn(),
    getInvitationTokenByEstablishmentId: jest.fn(),
  };
}
