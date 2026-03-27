

export const ESTABLISHMENT_REPOSITORY = Symbol('ESTABLISHMENT_REPOSITORY');

export interface EstablishmentRepository {
    getEstablishmentByUserId(userId: string): Promise<any>;
}