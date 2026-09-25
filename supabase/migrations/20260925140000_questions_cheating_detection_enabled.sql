-- Per-question anti-cheat toggle for quiz questions (default: enabled).

alter table public.questions
  add column if not exists cheating_detection_enabled boolean not null default true;
