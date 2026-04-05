-- Stripe subscription mirror (updated by webhooks / backend only).
-- subscriber_type + subscriber_id = polymorphic link to billing entity (no single FK).

-- ---------------------------------------------------------------------------
-- Enum: who is billed (add values with ALTER TYPE ... ADD VALUE if needed)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'subscription_subscriber_type' and n.nspname = 'public'
  ) then
    create type public.subscription_subscriber_type as enum (
      'establishment',
      'teacher',
      'standalone'
    );
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  subscriber_type public.subscription_subscriber_type not null,
  subscriber_id uuid not null,

  stripe_customer_id text not null,
  stripe_subscription_id text not null,

  status text not null,
  price_id text,
  product_id text,

  current_period_start timestamptz,
  current_period_end timestamptz,

  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint subscriptions_stripe_subscription_id_key unique (stripe_subscription_id)
);

comment on table public.subscriptions is
  'Mirror of Stripe subscription state; write from trusted backend (webhooks). subscriber_id points to establishment.id, teachers.id, or self_learners.id depending on subscriber_type.';

create index if not exists subscriptions_subscriber_idx
  on public.subscriptions (subscriber_type, subscriber_id);

create index if not exists subscriptions_stripe_customer_idx
  on public.subscriptions (stripe_customer_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions (status);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_subscriptions_updated_at();
