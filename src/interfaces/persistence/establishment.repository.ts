import { InvitationToken } from '../../domain/auth/invitation.type';
import { Establishment } from '../../domain/establishment/establishment.type';

export const ESTABLISHMENT_REPOSITORY = Symbol('ESTABLISHMENT_REPOSITORY');

export interface EstablishmentRepository {
  getEstablishmentById(establishmentId: string): Promise<Establishment>;
  getEstablishmentByUserId(userId: string): Promise<Establishment>;
  createEstablishment(
    supabaseUserId: string,
    name: string,
    email: string,
  ): Promise<Establishment>;
  getInvitationTokenByEstablishmentId(
    establishmentId: string,
  ): Promise<InvitationToken[]>;
}
