import {
  CreateEstablishmentBody,
  Establishment,
  EstablishmentType,
  SupabaseEstablishment,
} from 'src/domain/teaching/establishment/types/establishment.type';

type SupabaseEstablishmentInsert = {
  supabase_user_id: string;
  name: string;
  email: string;
  type: EstablishmentType;
  street: string;
  zip_code: string;
  city: string;
  country: string;
};

export const EstablishmentMapper = {
  toDomain: (row: SupabaseEstablishment): Establishment => ({
    id: row.id,
    supabaseUserId: row.supabase_user_id,
    name: row.name,
    email: row.email,
    type: row.type,
    address: {
      street: row.street,
      zipCode: row.zip_code,
      city: row.city,
      country: row.country,
    },
    createdAt: row.created_at,
  }),

  toInsert: (body: CreateEstablishmentBody): SupabaseEstablishmentInsert => ({
    supabase_user_id: body.supabaseUserId,
    name: body.name,
    email: body.email,
    type: body.type,
    street: body.address.street,
    zip_code: body.address.zipCode,
    city: body.address.city,
    country: body.address.country,
  }),
};
