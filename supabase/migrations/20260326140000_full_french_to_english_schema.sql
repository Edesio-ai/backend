-- Full schema normalization: French -> English for all legacy table/column names.
-- This migration is additive and idempotent.

-- ---------------------------------------------------------------------------
-- 1) Table renames
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.etablissements') is not null and to_regclass('public.establishment') is null then
    alter table public.etablissements rename to establishment;
  end if;

  if to_regclass('public.professeurs') is not null and to_regclass('public.teachers') is null then
    alter table public.professeurs rename to teachers;
  end if;

  if to_regclass('public.eleves') is not null and to_regclass('public.students') is null then
    alter table public.eleves rename to students;
  end if;

  if to_regclass('public.eleve_sessions') is not null and to_regclass('public.student_sessions') is null then
    alter table public.eleve_sessions rename to student_sessions;
  end if;

  if to_regclass('public.autodidactes') is not null and to_regclass('public.self_learners') is null then
    alter table public.autodidactes rename to self_learners;
  end if;

  if to_regclass('public.autodidacte_cours') is not null and to_regclass('public.self_learner_courses') is null then
    alter table public.autodidacte_cours rename to self_learner_courses;
  end if;

  if to_regclass('public.autodidacte_cours_fichiers') is not null and to_regclass('public.self_learner_course_files') is null then
    alter table public.autodidacte_cours_fichiers rename to self_learner_course_files;
  end if;

  if to_regclass('public.autodidacte_questions') is not null and to_regclass('public.self_learner_questions') is null then
    alter table public.autodidacte_questions rename to self_learner_questions;
  end if;

  if to_regclass('public.autodidacte_stats') is not null and to_regclass('public.self_learner_stats') is null then
    alter table public.autodidacte_stats rename to self_learner_stats;
  end if;

  if to_regclass('public.cours') is not null and to_regclass('public.courses') is null then
    alter table public.cours rename to courses;
  end if;

  if to_regclass('public.cours_fichiers') is not null and to_regclass('public.course_files') is null then
    alter table public.cours_fichiers rename to course_files;
  end if;

  if to_regclass('public.eleve_cours_stats') is not null and to_regclass('public.student_course_stats') is null then
    alter table public.eleve_cours_stats rename to student_course_stats;
  end if;

  if to_regclass('public.questions_cours') is not null and to_regclass('public.course_questions') is null then
    alter table public.questions_cours rename to course_questions;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2) Column renames (global helper)
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name in (
        'nom',
        'titre',
        'contenu',
        'contenu_texte',
        'langue',
        'fichier_url',
        'nom_fichier',
        'questions_tentees',
        'reponses_correctes',
        'derniere_tentative',
        'bonne_reponse',
        'bonnes_reponses',
        'position_ordre',
        'etablissement_id',
        'professeur_id',
        'eleve_id',
        'chatbots_alloues',
        'chatbots_disponibles',
        'reponse',
        'repondu_at'
      )
  loop
    -- nom -> name
    if r.column_name = 'nom' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='name'
      ) then
        execute format('alter table public.%I rename column %I to name', r.table_name, r.column_name);
      end if;
    end if;

    -- titre -> title
    if r.column_name = 'titre' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='title'
      ) then
        execute format('alter table public.%I rename column %I to title', r.table_name, r.column_name);
      end if;
    end if;

    -- contenu -> content
    if r.column_name = 'contenu' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='content'
      ) then
        execute format('alter table public.%I rename column %I to content', r.table_name, r.column_name);
      end if;
    end if;

    -- contenu_texte -> text_content
    if r.column_name = 'contenu_texte' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='text_content'
      ) then
        execute format('alter table public.%I rename column %I to text_content', r.table_name, r.column_name);
      end if;
    end if;

    -- langue -> language
    if r.column_name = 'langue' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='language'
      ) then
        execute format('alter table public.%I rename column %I to language', r.table_name, r.column_name);
      end if;
    end if;

    -- fichier_url -> file_url
    if r.column_name = 'fichier_url' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='file_url'
      ) then
        execute format('alter table public.%I rename column %I to file_url', r.table_name, r.column_name);
      end if;
    end if;

    -- nom_fichier -> file_name
    if r.column_name = 'nom_fichier' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='file_name'
      ) then
        execute format('alter table public.%I rename column %I to file_name', r.table_name, r.column_name);
      end if;
    end if;

    -- questions_tentees -> attempted_questions
    if r.column_name = 'questions_tentees' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='attempted_questions'
      ) then
        execute format('alter table public.%I rename column %I to attempted_questions', r.table_name, r.column_name);
      end if;
    end if;

    -- reponses_correctes -> correct_answers
    if r.column_name = 'reponses_correctes' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='correct_answers'
      ) then
        execute format('alter table public.%I rename column %I to correct_answers', r.table_name, r.column_name);
      end if;
    end if;

    -- derniere_tentative -> last_attempt_at
    if r.column_name = 'derniere_tentative' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='last_attempt_at'
      ) then
        execute format('alter table public.%I rename column %I to last_attempt_at', r.table_name, r.column_name);
      end if;
    end if;

    -- bonne_reponse -> correct_answer
    if r.column_name = 'bonne_reponse' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='correct_answer'
      ) then
        execute format('alter table public.%I rename column %I to correct_answer', r.table_name, r.column_name);
      end if;
    end if;

    -- bonnes_reponses -> correct_answers
    if r.column_name = 'bonnes_reponses' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='correct_answers'
      ) then
        execute format('alter table public.%I rename column %I to correct_answers', r.table_name, r.column_name);
      end if;
    end if;

    -- position_ordre -> position_order
    if r.column_name = 'position_ordre' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='position_order'
      ) then
        execute format('alter table public.%I rename column %I to position_order', r.table_name, r.column_name);
      end if;
    end if;

    -- etablissement_id -> establishment_id
    if r.column_name = 'etablissement_id' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='establishment_id'
      ) then
        execute format('alter table public.%I rename column %I to establishment_id', r.table_name, r.column_name);
      end if;
    end if;

    -- professeur_id -> teacher_id
    if r.column_name = 'professeur_id' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='teacher_id'
      ) then
        execute format('alter table public.%I rename column %I to teacher_id', r.table_name, r.column_name);
      end if;
    end if;

    -- eleve_id -> student_id
    if r.column_name = 'eleve_id' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='student_id'
      ) then
        execute format('alter table public.%I rename column %I to student_id', r.table_name, r.column_name);
      end if;
    end if;

    -- chatbots_alloues -> assigned_chatbots
    if r.column_name = 'chatbots_alloues' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='assigned_chatbots'
      ) then
        execute format('alter table public.%I rename column %I to assigned_chatbots', r.table_name, r.column_name);
      end if;
    end if;

    -- chatbots_disponibles -> available_chatbots
    if r.column_name = 'chatbots_disponibles' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='available_chatbots'
      ) then
        execute format('alter table public.%I rename column %I to available_chatbots', r.table_name, r.column_name);
      end if;
    end if;

    -- reponse -> answer
    if r.column_name = 'reponse' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='answer'
      ) then
        execute format('alter table public.%I rename column %I to answer', r.table_name, r.column_name);
      end if;
    end if;

    -- repondu_at -> answered_at
    if r.column_name = 'repondu_at' then
      if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name=r.table_name and column_name='answered_at'
      ) then
        execute format('alter table public.%I rename column %I to answered_at', r.table_name, r.column_name);
      end if;
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 3) Data normalization for enum-like text values still in French
--    Drop legacy CHECKs first — updating to English values would otherwise fail.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.suggestions') is not null then
    alter table public.suggestions drop constraint if exists suggestions_category_check;
  end if;

  if to_regclass('public.self_learner_courses') is not null then
    alter table public.self_learner_courses drop constraint if exists autodidacte_cours_langue_check;
    alter table public.self_learner_courses drop constraint if exists self_learner_courses_language_check;
  end if;

  if to_regclass('public.suggestions') is not null and exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='suggestions' and column_name='category'
  ) then
    update public.suggestions
    set category = case category
      when 'professeur' then 'teacher'
      when 'eleve' then 'student'
      when 'etablissement' then 'establishment'
      when 'autonome' then 'standalone'
      else category
    end
    where category in ('professeur', 'eleve', 'etablissement', 'autonome');
  end if;

  if to_regclass('public.self_learner_courses') is not null and exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='self_learner_courses' and column_name='language'
  ) then
    update public.self_learner_courses
    set language = case language
      when 'francais' then 'french'
      when 'anglais' then 'english'
      when 'espagnol' then 'spanish'
      when 'allemand' then 'german'
      else language
    end
    where language in ('francais', 'anglais', 'espagnol', 'allemand');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 4) Keep auth helper functions canonical in English
-- ---------------------------------------------------------------------------
create or replace function public.current_establishment_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.establishment where supabase_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_teacher_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.teachers where supabase_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_student_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.students where supabase_user_id = auth.uid() limit 1;
$$;

-- Backward aliases preserved to avoid breaking old policies/functions.
create or replace function public.current_etablissement_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select public.current_establishment_id();
$$;

create or replace function public.current_professeur_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select public.current_teacher_id();
$$;

create or replace function public.current_eleve_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select public.current_student_id();
$$;

-- ---------------------------------------------------------------------------
-- 5) Refresh critical check constraints with English values
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.suggestions') is not null then
    alter table public.suggestions drop constraint if exists suggestions_category_check;
    alter table public.suggestions add constraint suggestions_category_check
      check (category = any (array['teacher'::text, 'student'::text, 'establishment'::text, 'standalone'::text]));
  end if;

  if to_regclass('public.self_learner_courses') is not null then
    alter table public.self_learner_courses drop constraint if exists autodidacte_cours_langue_check;
    alter table public.self_learner_courses add constraint self_learner_courses_language_check
      check (language = any (array['french'::text, 'english'::text, 'spanish'::text, 'german'::text]));
  end if;

  if to_regclass('public.questions') is not null then
    alter table public.questions drop constraint if exists questions_type_check;
    alter table public.questions add constraint questions_type_check
      check (type = any (array['qcm'::text, 'open'::text]));
  end if;

  if to_regclass('public.self_learner_questions') is not null then
    alter table public.self_learner_questions drop constraint if exists autodidacte_questions_type_check;
    alter table public.self_learner_questions add constraint self_learner_questions_type_check
      check (type = any (array['qcm'::text, 'multi'::text, 'open'::text]));
  end if;
end
$$;
