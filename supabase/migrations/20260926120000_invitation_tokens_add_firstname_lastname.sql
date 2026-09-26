-- Persist invitee identity on invitation tokens (existing rows stay empty).

alter table public.invitation_tokens
  add column if not exists firstname text not null default '',
  add column if not exists lastname text not null default '';
