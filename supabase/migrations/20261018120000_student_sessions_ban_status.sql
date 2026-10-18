-- Soft-ban students in a session without deleting membership (keeps progress).

alter table public.student_sessions
  add column if not exists status text not null default 'active',
  add column if not exists banned_at timestamptz;

alter table public.student_sessions
  drop constraint if exists student_sessions_status_check;

alter table public.student_sessions
  add constraint student_sessions_status_check
  check (status in ('active', 'banned'));

create index if not exists idx_student_sessions_session_status
  on public.student_sessions (session_id, status);
