-- Remove self-learner feature tables and related suggestion category.

-- Child tables first (CASCADE also drops RLS policies / indexes / FKs).
drop table if exists public.self_learner_course_files cascade;
drop table if exists public.self_learner_questions cascade;
drop table if exists public.self_learner_stats cascade;
drop table if exists public.self_learner_courses cascade;
drop table if exists public.self_learners cascade;

-- Legacy French names (in case an environment never ran the rename migration).
drop table if exists public.autodidacte_cours_fichiers cascade;
drop table if exists public.autodidacte_questions cascade;
drop table if exists public.autodidacte_stats cascade;
drop table if exists public.autodidacte_cours cascade;
drop table if exists public.autodidactes cascade;

do $$
begin
  if to_regclass('public.suggestions') is null then
    return;
  end if;

  -- Keep existing rows valid before tightening the check constraint.
  update public.suggestions
  set category = 'standalone'
  where category = 'self-learner';

  alter table public.suggestions
    drop constraint if exists suggestions_category_check;

  alter table public.suggestions
    add constraint suggestions_category_check
    check (
      category = any (
        array[
          'teacher'::text,
          'student'::text,
          'establishment'::text,
          'standalone'::text
        ]
      )
    );
end
$$;
