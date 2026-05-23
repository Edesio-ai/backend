-- Allow suggestion category « self-learner » (align with Role / CreateSuggestionBodyDto).

do $$
begin
  if to_regclass('public.suggestions') is not null then
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
            'standalone'::text,
            'self-learner'::text
          ]
        )
      );
  end if;
end
$$;
