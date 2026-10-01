-- Convert correct_answers integer → numeric in place.
-- USING keeps every existing value (8 stays 8). No drop, no truncate, no reset.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_course_stats'
      and column_name = 'correct_answers'
      and data_type = 'integer'
  ) then
    alter table public.student_course_stats
      alter column correct_answers type numeric using correct_answers::numeric;
  end if;
end $$;
