import { Establishment } from "src/domain/establishment/establishment.type";


export const ESTABLISHMENT_REPOSITORY = Symbol('ESTABLISHMENT_REPOSITORY');

export interface EstablishmentRepository {
    getEstablishmentByUserId(userId: string): Promise<Establishment>;
    createEstablishment(supabaseUserId: string, name: string, email: string): Promise<Establishment>;
}