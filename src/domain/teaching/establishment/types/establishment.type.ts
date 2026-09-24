import { TeacherWithStats } from '../../teacher/types/teacher.type';

export const ESTABLISHMENT_TYPES = [
  'primary_school', // école
  'middle_school', // collège
  'high_school', // lycée
  'higher_education', // études supérieures
  'university', // université
  'graduate_school', // école supérieure / grande école
  'vocational_training', // CFA / formation pro
  'other',
] as const;

export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];

/** ISO 3166-1 alpha-2 — Europe (EU + UK/EFTA/micro-states) + US + CA */
export const ESTABLISHMENT_COUNTRIES = [
  'AD', // Andorra
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'CA', // Canada
  'CH', // Switzerland
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DE', // Germany
  'DK', // Denmark
  'EE', // Estonia
  'ES', // Spain
  'FI', // Finland
  'FR', // France
  'GB', // United Kingdom
  'GR', // Greece
  'HR', // Croatia
  'HU', // Hungary
  'IE', // Ireland
  'IS', // Iceland
  'IT', // Italy
  'LI', // Liechtenstein
  'LT', // Lithuania
  'LU', // Luxembourg
  'LV', // Latvia
  'MC', // Monaco
  'MT', // Malta
  'NL', // Netherlands
  'NO', // Norway
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SE', // Sweden
  'SI', // Slovenia
  'SK', // Slovakia
  'SM', // San Marino
  'US', // United States
  'VA', // Vatican City
] as const;

export type EstablishmentCountry = (typeof ESTABLISHMENT_COUNTRIES)[number];

export type EstablishmentAddress = {
  street: string;
  zipCode: string;
  city: string;
  country: EstablishmentCountry;
};

export type CreateEstablishmentBody = {
  supabaseUserId: string;
  name: string;
  email: string;
  type: EstablishmentType;
  address: EstablishmentAddress;
};

export type Establishment = {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  type: EstablishmentType;
  address: EstablishmentAddress;
  createdAt: string;
};

export type EstablishmentContact = {
  email: string;
  firstname: string;
  lastname: string;
};

export type EstablishmentWithContact = Establishment & {
  contact: EstablishmentContact;
};

export type UpdateEstablishmentPayload = Pick<Establishment, 'name' | 'email'>;

export type EstablishmentStats = {
  establishment: Establishment;
  teachers: TeacherWithStats[];
  stats: Stats;
};

export type Stats = {
  totalTeachers: number;
  totalSessions: number;
  totalStudents: number;
};

export type SupabaseEstablishment = {
  id: string;
  supabase_user_id: string;
  name: string;
  email: string;
  type: EstablishmentType;
  street: string;
  zip_code: string;
  city: string;
  country: EstablishmentCountry;
  created_at: string;
};
