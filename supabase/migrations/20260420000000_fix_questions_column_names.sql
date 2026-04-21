-- Fix remaining legacy column names in questions tables and refresh policies.
-- Idempotent migration.

-- ---------------------------------------------------------------------------
-- 1. questions table: rename legacy columns
-- ---------------------------------------------------------------------------
do $$
begin
  -- question -> question_text
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'question'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'question_text'
  ) then
    alter table public.questions rename column question to question_text;
  end if;

  -- propositions -> proposals
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'propositions'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'proposals'
  ) then
    alter table public.questions rename column propositions to proposals;
  end if;

  -- explication -> explanation
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'explication'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'explanation'
  ) then
    alter table public.questions rename column explication to explanation;
  end if;

  -- Merge correct_answer (text) into correct_answers (text[]) then drop correct_answer.
  -- correct_answer was bonne_reponse, correct_answers was bonnes_reponses.
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'correct_answer'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'questions' and column_name = 'correct_answers'
    ) then
      alter table public.questions add column correct_answers text[];
    end if;

    update public.questions
    set correct_answers = array[correct_answer]
    where correct_answer is not null
      and (correct_answers is null or correct_answers = '{}');

    alter table public.questions drop column correct_answer;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2. self_learner_questions table: same column renames
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'question'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'question_text'
  ) then
    alter table public.self_learner_questions rename column question to question_text;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'propositions'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'proposals'
  ) then
    alter table public.self_learner_questions rename column propositions to proposals;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'explication'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'explanation'
  ) then
    alter table public.self_learner_questions rename column explication to explanation;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'correct_answer'
  ) then
    -- Work via a staging column to avoid ALTER COLUMN TYPE USING subquery restriction.
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'correct_answers_new'
    ) then
      alter table public.self_learner_questions add column correct_answers_new text[];
    end if;

    -- Copy existing jsonb correct_answers → text[] (UPDATE allows subqueries)
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'correct_answers'
    ) then
      update public.self_learner_questions
      set correct_answers_new = array(select jsonb_array_elements_text(correct_answers))
      where correct_answers is not null
        and jsonb_typeof(correct_answers) = 'array'
        and jsonb_array_length(correct_answers) > 0;
    end if;

    -- Merge correct_answer (text) for rows still without a value
    update public.self_learner_questions
    set correct_answers_new = array[correct_answer]
    where correct_answer is not null
      and (correct_answers_new is null or correct_answers_new = '{}');

    -- Drop legacy columns
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'self_learner_questions' and column_name = 'correct_answers'
    ) then
      alter table public.self_learner_questions drop column correct_answers;
    end if;

    alter table public.self_learner_questions drop column correct_answer;

    -- Promote staging column
    alter table public.self_learner_questions rename column correct_answers_new to correct_answers;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 3. course_questions table: question -> question_text (consistency)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'course_questions' and column_name = 'question'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'course_questions' and column_name = 'question_text'
  ) then
    alter table public.course_questions rename column question to question_text;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 4. Drop legacy policies on questions and course_questions that still
--    reference old French table aliases, then recreate with English helpers.
-- ---------------------------------------------------------------------------
do $$
begin
  -- questions: professor policies
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Professors can delete questions in own courses') then
    drop policy "Professors can delete questions in own courses" on public.questions;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Professors can insert questions in own courses') then
    drop policy "Professors can insert questions in own courses" on public.questions;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Professors can update questions in own courses') then
    drop policy "Professors can update questions in own courses" on public.questions;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Professors can view questions in own courses') then
    drop policy "Professors can view questions in own courses" on public.questions;
  end if;

  -- course_questions: professor policies
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_questions' and policyname = 'Professors can delete questions for their courses') then
    drop policy "Professors can delete questions for their courses" on public.course_questions;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_questions' and policyname = 'Professors can update questions for their courses') then
    drop policy "Professors can update questions for their courses" on public.course_questions;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_questions' and policyname = 'Professors can view questions for their courses') then
    drop policy "Professors can view questions for their courses" on public.course_questions;
  end if;

  -- course_questions: student policies
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_questions' and policyname = 'Students can insert own questions') then
    drop policy "Students can insert own questions" on public.course_questions;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'course_questions' and policyname = 'Students can view questions in courses they joined') then
    drop policy "Students can view questions in courses they joined" on public.course_questions;
  end if;
end
$$;

-- Recreate questions policies with English helper functions.
create policy "Teachers can delete questions in own courses"
  on public.questions for delete
  using (
    course_id in (
      select c.id from public.courses c
      join public.sessions s on c.session_id = s.id
      where s.teacher_id = public.current_teacher_id()
    )
  );

create policy "Teachers can insert questions in own courses"
  on public.questions for insert
  with check (
    course_id in (
      select c.id from public.courses c
      join public.sessions s on c.session_id = s.id
      where s.teacher_id = public.current_teacher_id()
    )
  );

create policy "Teachers can update questions in own courses"
  on public.questions for update
  using (
    course_id in (
      select c.id from public.courses c
      join public.sessions s on c.session_id = s.id
      where s.teacher_id = public.current_teacher_id()
    )
  );

create policy "Teachers can view questions in own courses"
  on public.questions for select
  using (
    course_id in (
      select c.id from public.courses c
      join public.sessions s on c.session_id = s.id
      where s.teacher_id = public.current_teacher_id()
    )
  );

-- Recreate course_questions policies with English helper functions.
create policy "Teachers can delete course_questions in own courses"
  on public.course_questions for delete
  using (
    course_id in (
      select c.id from public.courses c
      join public.sessions s on c.session_id = s.id
      where s.teacher_id = public.current_teacher_id()
    )
  );

create policy "Teachers can update course_questions in own courses"
  on public.course_questions for update
  using (
    course_id in (
      select c.id from public.courses c
      join public.sessions s on c.session_id = s.id
      where s.teacher_id = public.current_teacher_id()
    )
  );

create policy "Teachers can view course_questions in own courses"
  on public.course_questions for select
  using (
    course_id in (
      select c.id from public.courses c
      join public.sessions s on c.session_id = s.id
      where s.teacher_id = public.current_teacher_id()
    )
  );

create policy "Students can insert own course_questions"
  on public.course_questions for insert
  with check (student_id = public.current_student_id());

create policy "Students can view own course_questions"
  on public.course_questions for select
  using (
    course_id in (
      select c.id from public.courses c
      join public.sessions s on c.session_id = s.id
      join public.student_sessions ss on ss.session_id = s.id
      where ss.student_id = public.current_student_id()
    )
  );
