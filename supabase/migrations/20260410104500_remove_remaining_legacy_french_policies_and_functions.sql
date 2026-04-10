-- Remove remaining legacy French naming from policies/functions.
-- Idempotent migration.

-- Canonical classmate visibility helper in English.
create or replace function public.visible_classmate_ids()
returns table(student_id uuid)
language sql
security definer
set search_path = public
as $$
  select distinct es2.student_id
  from public.student_sessions es2
  where es2.session_id in (
    select es.session_id
    from public.student_sessions es
    where es.student_id = public.current_student_id()
  )
  and es2.student_id <> public.current_student_id();
$$;

do $$
begin
  -- Establishment policies: rename FR labels and switch to English helper.
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_tokens'
      and policyname = 'Etablissements can delete own tokens'
  ) then
    alter policy "Etablissements can delete own tokens"
      on public.invitation_tokens
      rename to "Establishments can delete own tokens";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_tokens'
      and policyname = 'Etablissements can insert tokens'
  ) then
    alter policy "Etablissements can insert tokens"
      on public.invitation_tokens
      rename to "Establishments can insert tokens";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_tokens'
      and policyname = 'Etablissements can update own tokens'
  ) then
    alter policy "Etablissements can update own tokens"
      on public.invitation_tokens
      rename to "Establishments can update own tokens";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'teachers'
      and policyname = 'Etablissements can view own professors'
  ) then
    alter policy "Etablissements can view own professors"
      on public.teachers
      rename to "Establishments can view own teachers";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'invitation_tokens'
      and policyname = 'Etablissements can view own tokens'
  ) then
    alter policy "Etablissements can view own tokens"
      on public.invitation_tokens
      rename to "Establishments can view own tokens";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'courses'
      and policyname = 'Etablissements can view professor courses'
  ) then
    alter policy "Etablissements can view professor courses"
      on public.courses
      rename to "Establishments can view teacher courses";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'sessions'
      and policyname = 'Etablissements can view professor sessions'
  ) then
    alter policy "Etablissements can view professor sessions"
      on public.sessions
      rename to "Establishments can view teacher sessions";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'student_sessions'
      and policyname = 'Etablissements can view session memberships'
  ) then
    alter policy "Etablissements can view session memberships"
      on public.student_sessions
      rename to "Establishments can view session memberships";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'students'
      and policyname = 'Etablissements can view students'
  ) then
    alter policy "Etablissements can view students"
      on public.students
      rename to "Establishments can view students";
  end if;

  -- User profile policies with French words in labels.
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'self_learners'
      and policyname = 'Users can insert own autodidacte profile'
  ) then
    alter policy "Users can insert own autodidacte profile"
      on public.self_learners
      rename to "Users can insert own self_learner profile";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'self_learners'
      and policyname = 'Users can update own autodidacte profile'
  ) then
    alter policy "Users can update own autodidacte profile"
      on public.self_learners
      rename to "Users can update own self_learner profile";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'self_learners'
      and policyname = 'Users can view own autodidacte profile'
  ) then
    alter policy "Users can view own autodidacte profile"
      on public.self_learners
      rename to "Users can view own self_learner profile";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'establishment'
      and policyname = 'Users can insert own etablissement profile'
  ) then
    alter policy "Users can insert own etablissement profile"
      on public.establishment
      rename to "Users can insert own establishment profile";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'establishment'
      and policyname = 'Users can update own etablissement profile'
  ) then
    alter policy "Users can update own etablissement profile"
      on public.establishment
      rename to "Users can update own establishment profile";
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'establishment'
      and policyname = 'Users can view own etablissement profile'
  ) then
    alter policy "Users can view own etablissement profile"
      on public.establishment
      rename to "Users can view own establishment profile";
  end if;
end
$$;

-- Switch policy expressions to English helper functions/aliases.
alter policy "Establishments can delete own tokens"
  on public.invitation_tokens
  using (establishment_id = public.current_establishment_id());

alter policy "Establishments can insert tokens"
  on public.invitation_tokens
  with check (establishment_id = public.current_establishment_id());

alter policy "Establishments can update own tokens"
  on public.invitation_tokens
  using (establishment_id = public.current_establishment_id());

alter policy "Establishments can view own teachers"
  on public.teachers
  using (establishment_id = public.current_establishment_id());

alter policy "Establishments can view own tokens"
  on public.invitation_tokens
  using (establishment_id = public.current_establishment_id());

alter policy "Establishments can view teacher courses"
  on public.courses
  using (
    session_id in (
      select s.id
      from public.sessions s
      where s.teacher_id in (
        select t.id
        from public.teachers t
        where t.establishment_id = public.current_establishment_id()
      )
    )
  );

alter policy "Establishments can view teacher sessions"
  on public.sessions
  using (
    teacher_id in (
      select t.id
      from public.teachers t
      where t.establishment_id = public.current_establishment_id()
    )
  );

alter policy "Establishments can view session memberships"
  on public.student_sessions
  using (
    session_id in (
      select s.id
      from public.sessions s
      where s.teacher_id in (
        select t.id
        from public.teachers t
        where t.establishment_id = public.current_establishment_id()
      )
    )
  );

alter policy "Establishments can view students"
  on public.students
  using (
    id in (
      select es.student_id
      from public.student_sessions es
      where es.session_id in (
        select s.id
        from public.sessions s
        where s.teacher_id in (
          select t.id
          from public.teachers t
          where t.establishment_id = public.current_establishment_id()
        )
      )
    )
  );

alter policy "Students can insert own stats"
  on public.student_course_stats
  with check (student_id = public.current_student_id());

alter policy "Students can join sessions"
  on public.student_sessions
  with check (student_id = public.current_student_id());

alter policy "Students can leave sessions"
  on public.student_sessions
  using (student_id = public.current_student_id());

alter policy "Students can update own stats"
  on public.student_course_stats
  using (student_id = public.current_student_id());

alter policy "Students can view classmates"
  on public.students
  using (
    id in (
      select v.student_id
      from public.visible_classmate_ids() v
    )
  );

alter policy "Students can view own session memberships"
  on public.student_sessions
  using (student_id = public.current_student_id());

alter policy "Students can view own stats"
  on public.student_course_stats
  using (student_id = public.current_student_id());

alter policy "Students can view classmates stats for rankings"
  on public.student_course_stats
  using (
    course_id in (
      select c.id
      from public.courses c
      where c.session_id in (
        select ss.session_id
        from public.student_sessions ss
        where ss.student_id = public.current_student_id()
      )
    )
  );

alter policy "Students can view courses in joined sessions"
  on public.courses
  using (
    session_id in (
      select ss.session_id
      from public.student_sessions ss
      where ss.student_id = public.current_student_id()
    )
  );

alter policy "Students can view questions in joined sessions"
  on public.questions
  using (
    course_id in (
      select c.id
      from public.courses c
      where c.session_id in (
        select ss.session_id
        from public.student_sessions ss
        where ss.student_id = public.current_student_id()
      )
    )
  );

alter policy "Professors can view session memberships"
  on public.student_sessions
  using (
    session_id in (
      select s.id
      from public.sessions s
      where s.teacher_id = public.current_teacher_id()
    )
  );

alter policy "Professors can view students in own sessions"
  on public.students
  using (
    exists (
      select 1
      from public.student_sessions es
      join public.sessions s on s.id = es.session_id
      where es.student_id = students.id
        and s.teacher_id = public.current_teacher_id()
    )
  );

-- Drop legacy French helper aliases now that policies are migrated.
drop function if exists public.current_eleve_id();
drop function if exists public.current_professeur_id();
drop function if exists public.current_etablissement_id();
