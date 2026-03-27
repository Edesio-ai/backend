export type CreateEstablishmentBody = {
    supabaseUserId: string;
    name: string;
    email: string;
}

export type Establishment = {
    id: string;
    supabaseUserId: string;
    name: string;
    email: string;
    createdAt: string;
}