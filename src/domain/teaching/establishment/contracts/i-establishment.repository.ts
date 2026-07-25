import { UpdateStudentPayload } from '../../student/type/student.type';
import { Establishment } from '../types/establishment.type';

export const ESTABLISHMENT_REPOSITORY = Symbol('ESTABLISHMENT_REPOSITORY');

export interface IEstablishmentRepository {
  getEstablishmentById(establishmentId: string): Promise<Establishment | null>;
  getEstablishmentByUserId(userId: string): Promise<Establishment | null>;
  createEstablishment(supabaseUserId: string, name: string, email: string): Promise<Establishment>;
  updateEstablishment(userId: string, payload: UpdateStudentPayload): Promise<void>;
}
