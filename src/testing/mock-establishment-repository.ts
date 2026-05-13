import type { IEstablishmentRepository } from 'src/domain/teaching/establishment/contracts/i-establishment.repository';

export function createMockEstablishmentRepository(): jest.Mocked<IEstablishmentRepository> {
  return {
    getEstablishmentById: jest.fn(),
    getEstablishmentByUserId: jest.fn(),
    createEstablishment: jest.fn(),
    updateEstablishment: jest.fn(),
  };
}
