-- Recreate/normalize subscription table for Stripe billing domain.
-- Idempotent and safe for repeated runs.

do $$
begin
  if to_regclass('public.subscription') is null
     and to_regclass('public.subscriptions') is not null then
    alter table public.subscriptions rename to subscription;
  end if;
end
$$;

create table if not exists public.subscription (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  plan text,
  status text,
  cancel_at_period_end boolean not null default false,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  canceled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Legacy typo compatibility: suscriber_id -> subscriber_id.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscription'
      and column_name = 'suscriber_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscription'
      and column_name = 'subscriber_id'
  ) then
    alter table public.subscription rename column suscriber_id to subscriber_id;
  end if;
end
$$;

alter table public.subscription
  add column if not exists subscriber_id uuid,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_price_id text,
  add column if not exists plan text,
  add column if not exists status text,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists current_period_start timestamp with time zone,
  add column if not exists current_period_end timestamp with time zone,
  add column if not exists canceled_at timestamp with time zone,
  add column if not exists trial_start timestamp with time zone,
  add column if not exists trial_end timestamp with time zone,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

create index if not exists subscription_subscriber_id_idx
  on public.subscription (subscriber_id);

create index if not exists subscription_stripe_customer_id_idx
  on public.subscription (stripe_customer_id);

create index if not exists subscription_status_idx
  on public.subscription (status);

create index if not exists subscription_current_period_end_idx
  on public.subscription (current_period_end);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'subscription_stripe_subscription_id_key'
  ) then
    alter table public.subscription
      add constraint subscription_stripe_subscription_id_key
      unique (stripe_subscription_id);
  end if;
end
$$;
