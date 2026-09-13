create table public.tutoring_matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  mentor_id uuid not null references public.mentors(id) on delete restrict,
  application_id uuid not null references public.applications(id) on delete restrict,
  student_name text not null default '' check (char_length(student_name) <= 80),
  status text not null default 'active' check (status in ('active','paused','ended')),
  started_on date,
  ended_on date,
  admin_memo text not null default '' check (char_length(admin_memo) <= 2000),
  check (ended_on is null or status = 'ended'),
  check (started_on is null or ended_on is null or ended_on >= started_on)
);
create index tutoring_matches_created_idx on public.tutoring_matches(created_at desc,id);
create index tutoring_matches_mentor_idx on public.tutoring_matches(mentor_id,created_at desc);
create index tutoring_matches_application_idx on public.tutoring_matches(application_id,created_at desc);
create index tutoring_matches_status_idx on public.tutoring_matches(status,created_at desc);
create unique index tutoring_matches_open_uidx on public.tutoring_matches(mentor_id,application_id,lower(btrim(student_name))) where status in ('active','paused');
alter table public.tutoring_matches enable row level security;
revoke all on public.tutoring_matches from public,anon,authenticated;
grant select,insert,update,delete on public.tutoring_matches to service_role;
