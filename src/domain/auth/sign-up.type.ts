export type SignUpTeacherBody = {
    token: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}

export type User = {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    app_metadata: AppMetadata;
    user_metadata: UserMetadata;
    identities: Identity[];
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
}

type AppMetadata = {
    provider: string;
    providers: string[];
}

export type UserMetadata = {
    [key: string]: any
}

type Identity = {
    id: string;
    user_id: string;
    identity_data: IdentityData;
    provider: string;
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
    email: string;
}

type IdentityData = {
    email: string;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
}

export type Teacher = {
    id: string;
    supabase_user_id: string;
    name: string;
    email: string;
    created_at: string;
    establishment_id: string;
    available_chatbots: number;
}

export type RegisterBody = {
    role: 'teacher' | 'establishment' | 'student' | 'standalone';
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    acceptTerms: boolean;
    establishment?: string;
}