-- Aggregate quiz performance per student × question.
-- success rate = score_sum / attempts_count (fractional scores 0–1).
-- Notions to review are not persisted (returned by completion-feedback in v1).

create table if not exists public.student_question_stats (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  attempts_count integer not null default 0,
  score_sum numeric not null default 0,
  updated_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint student_question_stats_student_id_question_id_key unique (student_id, question_id)
);

create index if not exists idx_student_question_stats_student_course
  on public.student_question_stats (student_id, course_id);

create index if not exists idx_student_question_stats_course_id
  on public.student_question_stats (course_id);

alter table public.student_question_stats enable row level security;

drop policy if exists "Students can view own question stats" on public.student_question_stats;
create policy "Students can view own question stats"
  on public.student_question_stats
  for select
  using (student_id = public.current_student_id());

drop policy if exists "Students can insert own question stats" on public.student_question_stats;
create policy "Students can insert own question stats"
  on public.student_question_stats
  for insert
  with check (student_id = public.current_student_id());

drop policy if exists "Students can update own question stats" on public.student_question_stats;
create policy "Students can update own question stats"
  on public.student_question_stats
  for update
  using (student_id = public.current_student_id());

drop policy if exists "Teachers can view course question stats" on public.student_question_stats;
create policy "Teachers can view course question stats"
  on public.student_question_stats
  for select
  using (
    course_id in (
      select c.id
      from public.courses c
      join public.sessions s on s.id = c.session_id
      where s.teacher_id = public.current_teacher_id()
    )
  );

grant all on table public.student_question_stats to anon, authenticated, service_role;
