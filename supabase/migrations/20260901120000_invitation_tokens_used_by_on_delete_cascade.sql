-- Allow deleting a teacher even when invitation_tokens.used_by still points to them.
-- invitation_tokens.used_by had no ON DELETE action (default NO ACTION / 23503).

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'invitation_tokens_used_by_fkey'
      and connamespace = 'public'::regnamespace
  ) then
    alter table public.invitation_tokens
      drop constraint invitation_tokens_used_by_fkey;
  end if;
end
$$;

alter table public.invitation_tokens
  add constraint invitation_tokens_used_by_fkey
  foreign key (used_by) references public.teachers (id)
  on delete cascade;
