-- Final pass: rename remaining legacy French column names to English.
-- Idempotent migration.

do $$
begin
  -- courses.questions_validees -> courses.validated_questions
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'questions_validees'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'courses'
      and column_name = 'validated_questions'
  ) then
    alter table public.courses
      rename column questions_validees to validated_questions;
  end if;

  -- course_files.cours_id -> course_files.course_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'course_files'
      and column_name = 'cours_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'course_files'
      and column_name = 'course_id'
  ) then
    alter table public.course_files
      rename column cours_id to course_id;
  end if;

  -- questions.cours_id -> questions.course_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'questions'
      and column_name = 'cours_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'questions'
      and column_name = 'course_id'
  ) then
    alter table public.questions
      rename column cours_id to course_id;
  end if;

  -- course_questions.cours_id -> course_questions.course_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'course_questions'
      and column_name = 'cours_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'course_questions'
      and column_name = 'course_id'
  ) then
    alter table public.course_questions
      rename column cours_id to course_id;
  end if;

  -- student_course_stats.cours_id -> student_course_stats.course_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_course_stats'
      and column_name = 'cours_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_course_stats'
      and column_name = 'course_id'
  ) then
    alter table public.student_course_stats
      rename column cours_id to course_id;
  end if;

  -- self_learner_course_files.cours_id -> self_learner_course_files.course_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_course_files'
      and column_name = 'cours_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_course_files'
      and column_name = 'course_id'
  ) then
    alter table public.self_learner_course_files
      rename column cours_id to course_id;
  end if;

  -- self_learner_questions.cours_id -> self_learner_questions.course_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_questions'
      and column_name = 'cours_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_questions'
      and column_name = 'course_id'
  ) then
    alter table public.self_learner_questions
      rename column cours_id to course_id;
  end if;

  -- self_learner_stats.cours_id -> self_learner_stats.course_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_stats'
      and column_name = 'cours_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_stats'
      and column_name = 'course_id'
  ) then
    alter table public.self_learner_stats
      rename column cours_id to course_id;
  end if;

  -- self_learner_courses.autodidacte_id -> self_learner_courses.self_learner_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_courses'
      and column_name = 'autodidacte_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_courses'
      and column_name = 'self_learner_id'
  ) then
    alter table public.self_learner_courses
      rename column autodidacte_id to self_learner_id;
  end if;

  -- self_learner_stats.autodidacte_id -> self_learner_stats.self_learner_id
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_stats'
      and column_name = 'autodidacte_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_learner_stats'
      and column_name = 'self_learner_id'
  ) then
    alter table public.self_learner_stats
      rename column autodidacte_id to self_learner_id;
  end if;
end
$$;

do $$
begin
  -- Refresh index names that still contain French identifiers.
  if to_regclass('public.idx_cours_fichiers_cours_id') is not null
     and to_regclass('public.idx_course_files_course_id') is null then
    alter index public.idx_cours_fichiers_cours_id
      rename to idx_course_files_course_id;
  end if;

  if to_regclass('public.idx_questions_cours_cours_id') is not null
     and to_regclass('public.idx_course_questions_course_id') is null then
    alter index public.idx_questions_cours_cours_id
      rename to idx_course_questions_course_id;
  end if;

  if to_regclass('public.idx_eleve_cours_stats_cours_id') is not null
     and to_regclass('public.idx_student_course_stats_course_id') is null then
    alter index public.idx_eleve_cours_stats_cours_id
      rename to idx_student_course_stats_course_id;
  end if;

  if to_regclass('public.idx_autodidacte_cours_autodidacte_id') is not null
     and to_regclass('public.idx_self_learner_courses_self_learner_id') is null then
    alter index public.idx_autodidacte_cours_autodidacte_id
      rename to idx_self_learner_courses_self_learner_id;
  end if;

  if to_regclass('public.idx_autodidacte_cours_fichiers_cours_id') is not null
     and to_regclass('public.idx_self_learner_course_files_course_id') is null then
    alter index public.idx_autodidacte_cours_fichiers_cours_id
      rename to idx_self_learner_course_files_course_id;
  end if;

  if to_regclass('public.idx_autodidacte_questions_cours_id') is not null
     and to_regclass('public.idx_self_learner_questions_course_id') is null then
    alter index public.idx_autodidacte_questions_cours_id
      rename to idx_self_learner_questions_course_id;
  end if;

  if to_regclass('public.idx_autodidacte_stats_autodidacte_id') is not null
     and to_regclass('public.idx_self_learner_stats_self_learner_id') is null then
    alter index public.idx_autodidacte_stats_autodidacte_id
      rename to idx_self_learner_stats_self_learner_id;
  end if;

  if to_regclass('public.idx_autodidacte_stats_cours_id') is not null
     and to_regclass('public.idx_self_learner_stats_course_id') is null then
    alter index public.idx_autodidacte_stats_cours_id
      rename to idx_self_learner_stats_course_id;
  end if;
end
$$;
