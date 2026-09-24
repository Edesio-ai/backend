-- Add required establishment type and structured address columns.
-- Existing rows are backfilled before NOT NULL is enforced.

alter table public.establishment
  add column if not exists type text,
  add column if not exists street text,
  add column if not exists zip_code text,
  add column if not exists city text,
  add column if not exists country text;

update public.establishment
set
  type = coalesce(type, 'other'),
  street = coalesce(nullif(street, ''), 'Address to complete'),
  zip_code = coalesce(nullif(zip_code, ''), '00000'),
  city = coalesce(nullif(city, ''), 'Unknown'),
  country = coalesce(nullif(country, ''), 'FR')
where type is null
   or street is null
   or street = ''
   or zip_code is null
   or zip_code = ''
   or city is null
   or city = ''
   or country is null
   or country = '';

alter table public.establishment
  alter column type set not null,
  alter column street set not null,
  alter column zip_code set not null,
  alter column city set not null,
  alter column country set not null;

alter table public.establishment
  drop constraint if exists establishment_type_check;

alter table public.establishment
  add constraint establishment_type_check
  check (
    type = any (
      array[
        'primary_school'::text,
        'middle_school'::text,
        'high_school'::text,
        'higher_education'::text,
        'university'::text,
        'graduate_school'::text,
        'vocational_training'::text,
        'other'::text
      ]
    )
  );

-- Drop legacy inline address column if it was added previously.
alter table public.establishment
  drop column if exists address;
