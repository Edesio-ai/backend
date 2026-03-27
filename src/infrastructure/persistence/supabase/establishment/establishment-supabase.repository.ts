import { Inject } from "@nestjs/common";
import { EstablishmentRepository } from "src/interfaces/persistence/establishment.repository";
import { SUPABASE_ADMIN } from "../supabase.module";
import { EstablishmentNotFoundError } from "../../../../domain/establishment/error";

export class EstablishmentSupabaseRepository implements EstablishmentRepository {
    constructor(
        @Inject(SUPABASE_ADMIN)
        private readonly supabase: any,
    ) { }

    async getEstablishmentByUserId(userId: string): Promise<any> {
        const { data, error } = await this
        .supabase
        .from('establishment')
        .select('*')
        .eq('supabase_user_id', userId)
        .single();

        if (error || !data) {
            throw new EstablishmentNotFoundError(error.message);
        }
        return data;
    }
}