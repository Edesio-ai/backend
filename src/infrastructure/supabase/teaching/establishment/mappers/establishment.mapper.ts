import {
  CreateEstablishmentBody,
  Establishment,
  SupabaseEstablishment,
} from 'src/domain/teaching/types/establishment.type';

type SupabaseEstablishmentInsert = {
  supabase_user_id: string;
  name: string;
  email: string;
};

export const EstablishmentMapper = {
  toDomain: (row: SupabaseEstablishment): Establishment => ({
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  }),

  toInsert: (body: CreateEstablishmentBody): SupabaseEstablishmentInsert => ({
    supabase_user_id: body.supabaseUserId,
    name: body.name,
    email: body.email,
  }),
};
