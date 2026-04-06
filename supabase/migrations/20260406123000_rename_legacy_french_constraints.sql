-- Rename legacy French constraint names to English.
-- Goal: avoid PostgREST relationship lookups failing on explicit !<constraint> embeds.

do $$
begin
  -- Foreign keys
  if exists (select 1 from pg_constraint where conname = 'autodidacte_cours_autodidacte_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_courses_self_learner_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_courses rename constraint autodidacte_cours_autodidacte_id_fkey to self_learner_courses_self_learner_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidacte_cours_fichiers_cours_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_course_files_course_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_course_files rename constraint autodidacte_cours_fichiers_cours_id_fkey to self_learner_course_files_course_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidacte_questions_cours_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_questions_course_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_questions rename constraint autodidacte_questions_cours_id_fkey to self_learner_questions_course_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidacte_stats_autodidacte_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_stats_self_learner_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_stats rename constraint autodidacte_stats_autodidacte_id_fkey to self_learner_stats_self_learner_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidacte_stats_cours_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_stats_course_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_stats rename constraint autodidacte_stats_cours_id_fkey to self_learner_stats_course_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'cours_fichiers_cours_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'course_files_course_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.course_files rename constraint cours_fichiers_cours_id_fkey to course_files_course_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'cours_session_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'courses_session_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.courses rename constraint cours_session_id_fkey to courses_session_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleve_cours_stats_cours_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'student_course_stats_course_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.student_course_stats rename constraint eleve_cours_stats_cours_id_fkey to student_course_stats_course_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleve_cours_stats_eleve_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'student_course_stats_student_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.student_course_stats rename constraint eleve_cours_stats_eleve_id_fkey to student_course_stats_student_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleve_sessions_eleve_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'student_sessions_student_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.student_sessions rename constraint eleve_sessions_eleve_id_fkey to student_sessions_student_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleve_sessions_session_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'student_sessions_session_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.student_sessions rename constraint eleve_sessions_session_id_fkey to student_sessions_session_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'invitation_tokens_etablissement_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'invitation_tokens_establishment_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.invitation_tokens rename constraint invitation_tokens_etablissement_id_fkey to invitation_tokens_establishment_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'professeurs_etablissement_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'teachers_establishment_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.teachers rename constraint professeurs_etablissement_id_fkey to teachers_establishment_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'questions_cours_cours_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'course_questions_course_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.course_questions rename constraint questions_cours_cours_id_fkey to course_questions_course_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'questions_cours_eleve_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'course_questions_student_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.course_questions rename constraint questions_cours_eleve_id_fkey to course_questions_student_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'questions_cours_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'questions_course_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.questions rename constraint questions_cours_id_fkey to questions_course_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'sessions_professeur_id_fkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'sessions_teacher_id_fkey' and connamespace = 'public'::regnamespace) then
    alter table public.sessions rename constraint sessions_professeur_id_fkey to sessions_teacher_id_fkey;
  end if;

  -- Primary keys and unique constraints
  if exists (select 1 from pg_constraint where conname = 'autodidacte_cours_fichiers_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_course_files_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_course_files rename constraint autodidacte_cours_fichiers_pkey to self_learner_course_files_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidacte_cours_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_courses_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_courses rename constraint autodidacte_cours_pkey to self_learner_courses_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidacte_questions_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_questions_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_questions rename constraint autodidacte_questions_pkey to self_learner_questions_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidacte_stats_autodidacte_id_cours_id_key' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_stats_self_learner_id_course_id_key' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_stats rename constraint autodidacte_stats_autodidacte_id_cours_id_key to self_learner_stats_self_learner_id_course_id_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidacte_stats_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learner_stats_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learner_stats rename constraint autodidacte_stats_pkey to self_learner_stats_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidactes_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learners_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.self_learners rename constraint autodidactes_pkey to self_learners_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'autodidactes_supabase_user_id_key' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'self_learners_supabase_user_id_key' and connamespace = 'public'::regnamespace) then
    alter table public.self_learners rename constraint autodidactes_supabase_user_id_key to self_learners_supabase_user_id_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'cours_fichiers_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'course_files_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.course_files rename constraint cours_fichiers_pkey to course_files_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'cours_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'courses_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.courses rename constraint cours_pkey to courses_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleve_cours_stats_eleve_id_cours_id_key' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'student_course_stats_student_id_course_id_key' and connamespace = 'public'::regnamespace) then
    alter table public.student_course_stats rename constraint eleve_cours_stats_eleve_id_cours_id_key to student_course_stats_student_id_course_id_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleve_cours_stats_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'student_course_stats_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.student_course_stats rename constraint eleve_cours_stats_pkey to student_course_stats_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleve_sessions_eleve_id_session_id_key' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'student_sessions_student_id_session_id_key' and connamespace = 'public'::regnamespace) then
    alter table public.student_sessions rename constraint eleve_sessions_eleve_id_session_id_key to student_sessions_student_id_session_id_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleve_sessions_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'student_sessions_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.student_sessions rename constraint eleve_sessions_pkey to student_sessions_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleves_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'students_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.students rename constraint eleves_pkey to students_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'eleves_supabase_user_id_key' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'students_supabase_user_id_key' and connamespace = 'public'::regnamespace) then
    alter table public.students rename constraint eleves_supabase_user_id_key to students_supabase_user_id_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'etablissements_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'establishment_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.establishment rename constraint etablissements_pkey to establishment_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'etablissements_supabase_user_id_key' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'establishment_supabase_user_id_key' and connamespace = 'public'::regnamespace) then
    alter table public.establishment rename constraint etablissements_supabase_user_id_key to establishment_supabase_user_id_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'professeurs_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'teachers_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.teachers rename constraint professeurs_pkey to teachers_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'professeurs_supabase_user_id_key' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'teachers_supabase_user_id_key' and connamespace = 'public'::regnamespace) then
    alter table public.teachers rename constraint professeurs_supabase_user_id_key to teachers_supabase_user_id_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'questions_cours_pkey' and connamespace = 'public'::regnamespace)
     and not exists (select 1 from pg_constraint where conname = 'course_questions_pkey' and connamespace = 'public'::regnamespace) then
    alter table public.course_questions rename constraint questions_cours_pkey to course_questions_pkey;
  end if;
end
$$;
