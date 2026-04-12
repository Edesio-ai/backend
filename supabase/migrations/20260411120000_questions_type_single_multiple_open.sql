-- Question.type: single | multiple | open (remplace qcm / multi / ouverte / open hérités).

do $$
begin
  if to_regclass('public.questions') is not null then
    update public.questions set type = 'single' where type = 'qcm';
    update public.questions set type = 'multiple' where type = 'multi';
    update public.questions set type = 'open' where type in ('ouverte', 'open');

    update public.questions
    set type = 'open'
    where type is not null
      and type not in ('single', 'multiple', 'open');

    alter table public.questions drop constraint if exists questions_type_check;
    alter table public.questions add constraint questions_type_check
      check (type = any (array['single'::text, 'multiple'::text, 'open'::text]));
  end if;

  if to_regclass('public.self_learner_questions') is not null then
    update public.self_learner_questions set type = 'single' where type = 'qcm';
    update public.self_learner_questions set type = 'multiple' where type = 'multi';
    update public.self_learner_questions set type = 'open' where type in ('ouverte', 'open');

    update public.self_learner_questions
    set type = 'open'
    where type is not null
      and type not in ('single', 'multiple', 'open');

    alter table public.self_learner_questions drop constraint if exists self_learner_questions_type_check;
    alter table public.self_learner_questions add constraint self_learner_questions_type_check
      check (type = any (array['single'::text, 'multiple'::text, 'open'::text]));
  end if;
end
$$;
