import type { IEstablishmentRepository } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';

export function createMockEstablishmentRepository(): jest.Mocked<IEstablishmentRepository> {
  return {
    createEstablishment: jest.fn(),
    getEstablishmentById: jest.fn(),
    getEstablishmentByUserId: jest.fn(),
  };
}
