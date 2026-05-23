-- Revert self_learner_courses.language to French enum labels (francais, anglais, espagnol, allemand).
-- A later migration will standardize languages to English again.

do $$
begin
  if to_regclass('public.self_learner_courses') is not null
     and exists (
       select 1
       from information_schema.columns
       where table_schema = 'public'
         and table_name = 'self_learner_courses'
         and column_name = 'language'
     )
  then
    update public.self_learner_courses
    set language = case language
      when 'french' then 'francais'
      when 'english' then 'anglais'
      when 'spanish' then 'espagnol'
      when 'german' then 'allemand'
      else language
    end
    where language in ('french', 'english', 'spanish', 'german');

    alter table public.self_learner_courses
      drop constraint if exists self_learner_courses_language_check;

    alter table public.self_learner_courses
      add constraint self_learner_courses_language_check
      check (
        language = any (
          array[
            'francais'::text,
            'anglais'::text,
            'espagnol'::text,
            'allemand'::text
          ]
        )
      );
  end if;
end
$$;
