create table public.lesson_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid not null,
  mentor_id uuid not null references public.mentors(id) on delete restrict,
  student_name text not null check (char_length(student_name) between 1 and 80),
  lesson_date date not null,
  subject text not null check (char_length(subject) between 1 and 80),
  summary text not null check (char_length(summary) between 1 and 1500),
  progress text not null default '' check (char_length(progress) <= 1000),
  comment text not null default '' check (char_length(comment) <= 1000),
  status text not null default 'new' check (status in ('new','reviewed','follow_up')),
  admin_memo text not null default '' check (char_length(admin_memo) <= 2000),
  notification_status text not null default 'pending' check (notification_status in ('pending','sent','failed')),
  notification_attempt_at timestamptz not null default now(),
  unique (mentor_id, submission_id)
);
create index lesson_reports_mentor_date_idx on public.lesson_reports (mentor_id, lesson_date desc, created_at desc);
create index lesson_reports_date_idx on public.lesson_reports (lesson_date desc, created_at desc);
create index lesson_reports_status_idx on public.lesson_reports (status, lesson_date desc);
alter table public.lesson_reports enable row level security;
revoke all on public.lesson_reports from public, anon, authenticated;
grant select, insert, update, delete on public.lesson_reports to service_role;
