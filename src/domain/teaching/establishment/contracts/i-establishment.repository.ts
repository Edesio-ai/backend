import { UpdateStudentPayload } from '../../student/type/student.type';
import { CreateEstablishmentBody, Establishment } from '../types/establishment.type';

export const ESTABLISHMENT_REPOSITORY = Symbol('ESTABLISHMENT_REPOSITORY');

export interface IEstablishmentRepository {
  getEstablishmentById(establishmentId: string): Promise<Establishment | null>;
  getEstablishmentByUserId(userId: string): Promise<Establishment | null>;
  createEstablishment(body: CreateEstablishmentBody): Promise<Establishment>;
  updateEstablishment(userId: string, payload: UpdateStudentPayload): Promise<void>;
}
